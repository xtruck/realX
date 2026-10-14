# Safety and responsible use

realX produces synthetic video of people's faces. These controls ship with the product.

1. **Consent gate.** A swap needs a signed consent record for the source identity
   (who, scope, expiry). Without one the pipeline raises `ConsentError`.
2. **Watermark.** Every output frame carries a payload (product, version, session,
   consent id). The baseline implementation is an LSB embed. Production needs a
   robust watermark that survives compression.
3. **Provenance.** Exported files get C2PA content credentials (roadmap M4).
4. **Content filter.** Block nudity and graphic content as Deep-Live-Cam does, with a
   licensed classifier. Interface exists, model pending.
5. **Terms of use.** No impersonation, fraud, harassment or non-consensual sexual
   content. Account-level enforcement for the hosted tier.
6. **Logging.** Hosted tier keeps an audit trail of consent id, session and time.

These are product requirements, not optional extras. Payment processors, app stores
and most jurisdictions now expect them.

## What the character, background and voice-preset features do and do not touch

- **Character (Pip).** An original cartoon with no likeness of a real person. The browser
  gets head-pose numbers only. The stream announces itself as a virtual character
  (hello message and an on-screen badge, which `?badge=off` hides).
- **Background replacement.** Edits only the area around the user's own picture; the
  person's pixels are never regenerated. Photos stay in memory. A pipeline cannot place
  it after a watermark, because that would erase the mark.
- **Voice presets.** Effects on your own voice. There is no speaker data in a preset, and
  the test suite fails if a field that could hold one is added without review.
- **Unchanged.** Anything that imitates a real person (`voice_convert`, face swaps) still
  needs a consent gate before it and a watermark after it. `inswapper_128` and `buffalo_l`
  stay blocked.
