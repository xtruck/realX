// Step S5: asks the local server for consent to draw a photo, and keeps the signed record in memory.
//
// What leaves the page here is small and fixed: the photo's SHA-256 (64 characters, computed in the browser), the user's
// statement, the number of hours, and the signed record. Never the photo, never a picture from the camera. Nothing is
// stored: no localStorage, no cookie of our own; closing the page ends the consent in practice, and the server ends it
// at its expiry or on request. The only network calls are to /api/facemesh/*; facemesh.test.mjs checks that.

const GRACE_MS = 6000;   // a check that fails or is not answered is tolerated this long, then the photo must stop

/** SHA-256 of a file's bytes, as 64 lowercase hex characters. The bytes stay in the browser. */
export async function sha256Hex(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export class ConsentClient {
  /** `fetchFn` and `now` can be replaced (the tests do); by default the browser's. */
  constructor({ fetchFn = (...args) => fetch(...args), now = () => Date.now() } = {}) {
    this.fetchFn = fetchFn; this.now = now;
    this.clear();
  }

  clear() {
    this.record = null; this.sha = null; this.expiresAtMs = 0; this.lastOkMs = 0; this.endedReason = "";
  }

  async post(path, body) {
    const response = await this.fetchFn(path, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(body),
    });
    let data = {};
    try { data = await response.json(); } catch (err) { /* an empty or odd body: the status says enough */ }
    if (!response.ok) { const error = new Error((data && data.error) || `the server said ${response.status}`); error.status = response.status; throw error; }
    return data;
  }

  /** The statement the user is asked to make, and the lengths on offer. */
  async terms() {
    const response = await this.fetchFn("/api/facemesh/terms", { credentials: "same-origin" });
    if (!response.ok) throw new Error(`the server said ${response.status}`);
    return response.json();
  }

  /** Records the user's statement for this photo (by hash) and keeps the signed answer. Throws when the server refuses. */
  async issue(sha256, hours, attested) {
    const data = await this.post("/api/facemesh/consent", { sha256, attested: attested === true, hours });
    this.record = data.record; this.sha = sha256; this.endedReason = "";
    this.lastOkMs = this.now(); this.expiresAtMs = this.lastOkMs + data.seconds * 1000;
    return data.seconds;
  }

  /** Asks the server whether the record still stands (signature, photo, expiry, revocation). Never throws. */
  async check() {
    if (!this.record) return { ok: false, reason: "no consent" };
    try {
      const data = await this.post("/api/facemesh/consent/check", { record: this.record, sha256: this.sha });
      this.lastOkMs = this.now(); this.expiresAtMs = this.lastOkMs + data.seconds * 1000;
      return { ok: true, reason: "" };
    } catch (err) {
      if (err.status === 403 || err.status === 400) { this.endedReason = err.message; return { ok: false, reason: err.message }; }   // the server said no: final
      return { ok: false, reason: "the server did not answer" };                                                                   // not final: valid() allows a short grace
    }
  }

  /** Ends the record on the server (best effort) and forgets it here. */
  async revoke() {
    const record = this.record;
    this.clear();
    if (!record) return;
    try { await this.post("/api/facemesh/consent/revoke", { record }); } catch (err) { /* already ended or the server is gone: the record is forgotten either way */ }
  }

  /** { ok, reason } at `atMs`: a record, not ended, not expired, and heard from the server recently enough. */
  valid(atMs = this.now()) {
    if (!this.record) return { ok: false, reason: "no consent" };
    if (this.endedReason) return { ok: false, reason: `consent ended: ${this.endedReason}` };
    if (atMs >= this.expiresAtMs) return { ok: false, reason: "consent expired" };
    if (atMs - this.lastOkMs > GRACE_MS) return { ok: false, stale: true, reason: "the server has not confirmed the consent for a while" };
    return { ok: true, reason: "" };
  }

  /** Seconds left, for display. */
  secondsLeft(atMs = this.now()) { return this.record ? Math.max(0, (this.expiresAtMs - atMs) / 1000) : 0; }
}
