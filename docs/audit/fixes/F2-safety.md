# F2 - safety fixes (B2-02, B3-04, B3-05, B3-06, tombstone, B4-09)

Watermark algorithm and payload are unchanged. `server.py` is untouched.

## Before / after

| Finding | Before | After | Tests |
|---|---|---|---|
| B2-02 / B3-04 stage guard | Ordering trusted flags a stage declared. A synthesiser or pixel editor that omitted its flags passed. Strict mode accepted any `allow`ed class that claimed no safety role. | New optional `role` ("synthesizer", "editor", "neutral"); the role implies `requires_consent`/`alters_media`, so `validate_stages` checks it even with no flags. Strict mode: a class realX did not register (only reachable via `allow`) must declare a role, and `neutral` is refused if its flags say it edits or synthesises. Every realX-registered stage is unchanged (it already declares flags). | `tests/test_f2_stage_guard.py` |
| B3-04 helpers | `cohost_stages` and `portrait_stages` returned plain lists. | Both run `validate_built` (ordering + strict, `allow` = the renderer/driver classes the caller passed) before returning. | same |
| B3-04 `gate.grant` | `grant(ctx, subject_id)` minted a pass with no check. | `grant(ctx, store, record, scope)` verifies the record (signature, scope, expiry, revocation) then mints. `ConsentGate` uses it. | same |
| B3-05 audio mark in video pipeline | Accepted at build, `AttributeError` on frame 1. | Stages carry `media` ("video" default, "audio" for `AudioWatermark`, `VoiceConvert`). A watermark only covers synthesisers of its own media; mismatch is a build-time `PipelineConfigError`. | same |
| B3-06 clock set back | `verify` used the raw wall clock; setting it back revived an expired record. | `ConsentStore` keeps a high-water mark of the latest time it saw and judges expiry against `max(now, mark)`. `CohostVault` persists it in `clock.seen` (rewritten at most every 30 s). Works with an injected `now`. | `tests/test_f2_consent_clock.py` |
| Tombstone deletion | Deleting `<id>.revoked` restored consent silently. | Revocations are also written to `revocations.idx`, an HMAC-signed list (vault key). Revoked = tombstone exists OR id in a valid index. A missing, unreadable or tampered index fails closed (all records revoked). A new vault gets an empty index at creation; a vault that has grants but no index fails closed. | `tests/test_f2_revocation.py` |
| B4-09 / cohost crashes | The revoke code was printed after a line containing the name; an unencodable name raised and exit 2 left a live consent with no code. `grant` without `--name`, `check` without `--file`, `revoke` without `--id/--code` gave a traceback. | Code (ASCII) is printed first and saved to `<id>.revoke-code.txt` (0600) which the user is told about; every echoed line goes through `_say` (`errors="replace"`). Missing options are an argparse usage error (exit 2). | `tests/test_f2_cli_cohost.py` (cp1252 stdout) |

## Design notes and limits

- Role rule chosen: strict mode requires a declared role for any class realX does not own; it does not force a role on realX's own registered stages (they already declare flags and are covered by the existing tests).
- `strict=False` stays the `Pipeline` default (not changed) because `tests/test_core.py` and other tests build plain pipelines with test stages. `validate_stages` (always run) is now role-aware. `StudioController` and the two `*_stages` helpers are strict.
- The signed index and clock mark share the vault key in the vault folder: they stop an accidental or casual single-file deletion or clock reset, not someone with full control of the folder who can re-sign (roadmap M4: key the streamer does not hold). A vault created before this change that already holds grants has no index and so fails closed; re-grant.
- Clock mark is in-memory plus `clock.seen`; deleting `clock.seen` and resetting the clock together defeats it (same limit).
- `gate.grant` signature changed (one test in `tests/test_portrait.py` updated; its stale-proof check now mints before revoking).

## Proposed PROGRESS.md entry

```
- Safety hardening (F2): stages can declare a `role` and strict mode requires one from any class realX does not own; watermark must match the media (audio mark no longer accepted for a video synthesiser, checked at build); `cohost_stages` / `portrait_stages` validate what they return; `gate.grant` now verifies the consent record; consent expiry uses a high-water clock mark (persisted in the co-host vault) so a clock set back cannot revive it; revocations are kept in a signed index so deleting a `.revoked` file no longer restores consent (a missing index fails closed); `realx cohost grant` prints the revoke code first, saves it to a file and no longer fails on non-encodable names, and missing options are usage errors. Docs: docs/audit/fixes/F2-safety.md.
```
