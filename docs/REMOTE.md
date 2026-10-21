# Remote adapter (not connected to anything)

`realx.remote` is a transport abstraction and a fake. There is **no real transport**, no HTTP client, no provider,
and no code path that opens a socket. Cloud processing is off by default and stays off until a real transport has
been reviewed against the list below.

What is enforced now (`tests/test_remote.py`, with the network patched to fail the test if touched):

* **Opt-in:** `RemoteConfig.enabled` is False by default; `REALX_REMOTE=1` only selects it.
* **Destination:** an https URL whose host is in `allowed_hosts` (lower-case DNS names; no IPs, wildcards, ports, userinfo).
* **Credential:** the config names an environment variable; the value is read at send time, sent only as an `Authorization`
  header, and never stored, printed, logged or put in an exception.
* **Bounds:** timeout 0-30 s, cancel on request, one request in flight, request <= 2 KiB, response <= 4 KiB.
* **What is sent:** exactly `{"rig":{depth,pitch,roll,scale,smile,x,y,yaw},"seq":n,"v":1}`. Camera frames, portrait images,
  landmarks, track ids and any text cannot be passed in; a wrong field is an error, not dropped silently.
* **Logs:** host and byte count only.

Before any real transport is added, all of this has to be written down and agreed: who the provider is and their
data-retention and deletion terms (how long they keep rig numbers, how a deletion is requested and confirmed);
that no image or video ever leaves (a portrait upload would need its own explicit, per-image opt-in and consent
record); how redirects, TLS verification and proxies are handled; where the credential is stored; and a test that
captures the real request bytes. Retention by realX itself: none, the adapter keeps counters only.

## Path B: a rented GPU for a private build (approved 2026-10-21)

The limits above (rig numbers only, no real transport) still describe the default `realx` package and its tests. For the owner's private,
non-distributed build, `docs/DECISION-PATH-B.md` approves a separate link that may carry JPEG frames or face crops to a rented GPU the owner controls,
under guard rails G1 to G10 (opt-in, HTTPS only on an allow-listed host, a per-session token, an ephemeral instance with no retention, bounded
payloads, the label and the watermark drawn locally after the frame returns, fall back to the local picture within one second, immediate stop on
revocation, no pixels in logs, a test on the real request bytes). Provider and retention terms are **not chosen yet**; they must be written here
before the first real connection.
