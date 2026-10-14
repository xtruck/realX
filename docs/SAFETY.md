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
