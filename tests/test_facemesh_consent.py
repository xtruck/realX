"""Consent for the face-mesh page: the signed record bound to one photo's hash, and the routes that issue, check and end it."""

from __future__ import annotations

import hashlib
import http.client
import json

import pytest

from realx.safety.consent import ConsentError
from realx.safety.facemesh_consent import DEFAULT_HOURS, MAX_HOURS, TERMS, FaceMeshConsent, record_from_dict
from realx.safety.portrait_consent import issue_portrait_consent_for_hash, scope_for_hash
from realx.server import Engine, Server

PHOTO = hashlib.sha256(b"a photo").hexdigest()
OTHER = hashlib.sha256(b"another photo").hexdigest()


# --- the record ---------------------------------------------------------------------------------------------------------

def test_a_record_covers_the_photo_it_was_issued_for_and_says_how_long_is_left():
    c = FaceMeshConsent()
    rec = c.issue(PHOTO, True, 2, now=1000.0)
    assert rec["scope"] == f"portrait:{PHOTO}" and rec["subject_id"] == "self" and rec["expires_at"] == 1000.0 + 7200
    assert c.check(rec, PHOTO, now=1100.0) == pytest.approx(7100.0)


def test_it_is_refused_without_the_statement_and_for_bad_input():
    c = FaceMeshConsent()
    for attested in (False, None, "yes", 1, "true"):
        with pytest.raises(ConsentError):
            c.issue(PHOTO, attested, 1)
    for bad in ("", "abc", PHOTO.upper(), PHOTO[:-1], PHOTO + "0", None, 5):
        with pytest.raises(ValueError):
            c.issue(bad, True, 1)
    for hours in (0, -1, MAX_HOURS + 0.01, True, "2", None, float("nan"), float("inf")):
        with pytest.raises(ValueError):
            c.issue(PHOTO, True, hours)
    assert c.issue(PHOTO, True, MAX_HOURS)["expires_at"] > 0


def test_a_record_for_one_photo_does_not_cover_another():
    c = FaceMeshConsent()
    rec = c.issue(PHOTO, True, 1)
    with pytest.raises(ConsentError, match="scope"):
        c.check(rec, OTHER)


def test_it_expires_and_can_be_ended():
    c = FaceMeshConsent()
    old = c.issue(PHOTO, True, 1, now=1000.0)
    with pytest.raises(ConsentError, match="expired"):
        c.check(old, PHOTO, now=1000.0 + 3600)
    with pytest.raises(ConsentError, match="expired"):
        c.revoke(old)                                   # one that has already ended needs no ending
    rec = c.issue(PHOTO, True, 1)                       # now, in real time
    assert c.check(rec, PHOTO) > 0
    c.revoke(rec)
    with pytest.raises(ConsentError, match="revoked"):
        c.check(rec, PHOTO)
    with pytest.raises(ConsentError, match="revoked"):
        c.revoke(rec)


def test_a_forged_edited_or_foreign_record_is_refused():
    c = FaceMeshConsent()
    rec = c.issue(PHOTO, True, 1, now=1000.0)
    with pytest.raises(ConsentError, match="signature"):
        c.check({**rec, "expires_at": rec["expires_at"] + 86400}, PHOTO, now=1001.0)        # lived longer than it was signed for
    with pytest.raises(ConsentError):
        c.check({**rec, "scope": f"portrait:{OTHER}"}, OTHER, now=1001.0)                    # re-pointed at another photo
    with pytest.raises(ConsentError, match="signature"):
        c.check({**rec, "signature": "0" * 64}, PHOTO, now=1001.0)
    with pytest.raises(ConsentError, match="signature"):
        FaceMeshConsent().check(rec, PHOTO, now=1001.0)                                      # signed by another run's key
    with pytest.raises(ConsentError):
        c.revoke({**rec, "signature": "0" * 64})                                             # a forged record cannot end anything


def test_it_is_for_the_person_using_the_page_only():
    c = FaceMeshConsent()
    someone_else = issue_portrait_consent_for_hash(c.store, "kofi", PHOTO, 3600, True)
    data = {k: getattr(someone_else, k) for k in ("subject_id", "scope", "expires_at", "record_id", "key_id", "signature")}
    with pytest.raises(ConsentError, match="person using the page"):
        c.check(data, PHOTO)


def test_records_from_json_have_exactly_the_known_fields():
    rec = FaceMeshConsent().issue(PHOTO, True, 1)
    assert record_from_dict(rec).scope == f"portrait:{PHOTO}"
    for bad in (None, [], "x", {}, {**rec, "extra": 1}, {k: v for k, v in rec.items() if k != "signature"},
                {**rec, "expires_at": "soon"}, {**rec, "expires_at": True}, {**rec, "record_id": 5}, {**rec, "scope": None}):
        with pytest.raises(ValueError):
            record_from_dict(bad)


def test_the_hash_must_be_exactly_a_lowercase_sha256():
    assert scope_for_hash(PHOTO) == f"portrait:{PHOTO}"
    for bad in ("", PHOTO.upper(), "g" * 64, PHOTO[:63], None, 12, b"x" * 64):
        with pytest.raises(ValueError):
            scope_for_hash(bad)


def test_terms_say_what_is_promised():
    t = FaceMeshConsent().terms()
    assert t["attestation"] == TERMS and "Virtual face" in TERMS and "of you" in TERMS
    assert t["default_hours"] == DEFAULT_HOURS and t["max_hours"] == MAX_HOURS


# --- the routes ---------------------------------------------------------------------------------------------------------

TOKEN = "facemesh-consent-token-abcdef0123456789"


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def call(srv, method, path, body=None, *, token=True, origin=True, content_type="application/json"):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    headers = {"Host": f"127.0.0.1:{srv.port}"}
    if token:
        headers["Cookie"] = f"realx_token={TOKEN}"
    if origin:
        headers["Origin"] = f"http://127.0.0.1:{srv.port}"
    if content_type:
        headers["Content-Type"] = content_type
    data = None if body is None else (body if isinstance(body, (bytes, str)) else json.dumps(body))
    c.request(method, path, body=data, headers=headers)
    r = c.getresponse()
    raw = r.read()
    c.close()
    try:
        return r.status, json.loads(raw or b"{}")
    except ValueError:
        return r.status, {}


@pytest.mark.raw_http
def test_routes_need_the_token_and_the_same_origin(srv):
    assert call(srv, "GET", "/api/facemesh/terms", token=False)[0] == 401
    assert call(srv, "POST", "/api/facemesh/consent", {"sha256": PHOTO, "attested": True}, token=False)[0] == 401
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)   # another site's page asks for consent in the user's name
    c.request("POST", "/api/facemesh/consent", body=json.dumps({"sha256": PHOTO, "attested": True}),
              headers={"Host": f"127.0.0.1:{srv.port}", "Cookie": f"realx_token={TOKEN}", "Origin": "http://evil.example",
                       "Content-Type": "application/json"})
    assert c.getresponse().status == 403
    c.close()


@pytest.mark.raw_http
def test_issue_check_and_end_a_record_over_http(srv):
    status, terms = call(srv, "GET", "/api/facemesh/terms")
    assert status == 200 and "Virtual face" in terms["attestation"]

    assert call(srv, "POST", "/api/facemesh/consent", {"sha256": PHOTO, "attested": False})[0] == 403, "no statement, no record"
    assert call(srv, "POST", "/api/facemesh/consent", {"sha256": "nope", "attested": True})[0] == 400
    assert call(srv, "POST", "/api/facemesh/consent", {"sha256": PHOTO, "attested": True, "hours": 99})[0] == 400
    assert call(srv, "POST", "/api/facemesh/consent", "not json")[0] == 400
    assert call(srv, "POST", "/api/facemesh/consent", [1, 2])[0] == 400
    assert call(srv, "POST", "/api/facemesh/consent", {"sha256": PHOTO, "attested": True}, content_type="text/plain")[0] == 400

    status, issued = call(srv, "POST", "/api/facemesh/consent", {"sha256": PHOTO, "attested": True, "hours": 1})
    assert status == 200 and 3500 < issued["seconds"] <= 3600
    record = issued["record"]

    status, ok = call(srv, "POST", "/api/facemesh/consent/check", {"record": record, "sha256": PHOTO})
    assert status == 200 and ok["ok"] is True and ok["seconds"] > 3000
    assert call(srv, "POST", "/api/facemesh/consent/check", {"record": record, "sha256": OTHER})[0] == 403, "another photo"
    assert call(srv, "POST", "/api/facemesh/consent/check", {"record": {**record, "signature": "0" * 64}, "sha256": PHOTO})[0] == 403
    assert call(srv, "POST", "/api/facemesh/consent/check", {"record": {"x": 1}, "sha256": PHOTO})[0] == 400

    assert call(srv, "POST", "/api/facemesh/consent/revoke", {"record": record})[0] == 200
    status, refused = call(srv, "POST", "/api/facemesh/consent/check", {"record": record, "sha256": PHOTO})
    assert status == 403 and "revoked" in refused["error"], "an ended record stops verifying at once"


# --- Stage 3: the front photo and its side photos checked in one request --------------------------------------------------

def test_check_many_answers_each_record_on_its_own():
    c = FaceMeshConsent()
    a, b = c.issue(PHOTO, True, 1, now=1000.0), c.issue(OTHER, True, 1, now=1000.0)
    out = c.check_many([{"record": a, "sha256": PHOTO}, {"record": b, "sha256": PHOTO}, {"record": {"x": 1}, "sha256": PHOTO}], now=1100.0)
    assert out[0] == {"ok": True, "seconds": pytest.approx(3500.0)}
    assert out[1]["ok"] is False and "scope" in out[1]["error"], "a record for another photo fails only its own entry"
    assert out[2]["ok"] is False and "fields" in out[2]["error"], "a malformed record fails only its own entry"
    live = c.issue(PHOTO, True, 1)                      # in real time, so it can be ended now
    c.revoke(live)
    ended = c.check_many([{"record": live, "sha256": PHOTO}])[0]
    assert ended["ok"] is False and "revoked" in ended["error"]


def test_check_many_refuses_a_malformed_batch_as_a_whole():
    from realx.safety.facemesh_consent import MAX_BATCH
    c = FaceMeshConsent()
    rec = c.issue(PHOTO, True, 1)
    item = {"record": rec, "sha256": PHOTO}
    for bad in (None, {}, "x", [], [item] * (MAX_BATCH + 1), [item, "x"], [{"record": rec}], [{**item, "extra": 1}]):
        with pytest.raises(ValueError):
            c.check_many(bad)
    assert len(c.check_many([item] * MAX_BATCH)) == MAX_BATCH


@pytest.mark.raw_http
def test_the_batched_check_route_needs_the_token_and_fits_a_full_batch(srv):
    from realx.safety.facemesh_consent import MAX_BATCH
    records = []
    for i in range(MAX_BATCH):
        sha = hashlib.sha256(f"photo {i}".encode()).hexdigest()
        status, issued = call(srv, "POST", "/api/facemesh/consent", {"sha256": sha, "attested": True, "hours": 1})
        assert status == 200
        records.append({"record": issued["record"], "sha256": sha})
    body = {"items": records}
    assert len(json.dumps(body)) < 4096, "a full batch must fit the server's 4 KiB JSON limit"
    assert call(srv, "POST", "/api/facemesh/consent/check-batch", body, token=False)[0] == 401
    status, out = call(srv, "POST", "/api/facemesh/consent/check-batch", body)
    assert status == 200 and [r["ok"] for r in out["results"]] == [True] * MAX_BATCH
    assert call(srv, "POST", "/api/facemesh/consent/revoke", {"record": records[2]["record"]})[0] == 200
    status, out = call(srv, "POST", "/api/facemesh/consent/check-batch", body)
    assert status == 200 and [r["ok"] for r in out["results"]] == [True, True, False, True, True]
    assert "revoked" in out["results"][2]["error"]
    assert call(srv, "POST", "/api/facemesh/consent/check-batch", {"items": []})[0] == 400
    assert call(srv, "POST", "/api/facemesh/consent/check-batch", {"items": records * 2})[0] == 400
