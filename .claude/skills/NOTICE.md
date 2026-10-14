# Third-party skills

Plain markdown guidance, no scripts or hooks, copied unmodified. Both sources are MIT licensed.

- ECC (https://github.com/affaan-m/ECC, commit b92f181, (c) 2026 Affaan Mustafa):
  python-testing, python-patterns, security-review, tdd-workflow, e2e-testing, browser-qa,
  verification-loop, coding-standards, frontend-patterns, accessibility, frontend-a11y,
  api-design, backend-patterns, security-scan, agent-security-hardening.
- All other ECC skills: the markdown files of every skill folder were copied (scripts, JSON and
  other non-markdown files were left out on purpose, so a few skills that point at helper scripts
  are incomplete). Many target other stacks (Django, Kotlin, Perl, ...) and are only useful if you
  work in those.
- REA (https://github.com/morluto/rea, commit 60c0880, (c) 2026 morluto):
  reverse-engineer-anything. Use it on software we are allowed to inspect (open source,
  our own builds, public client code for interoperability). Not for copying proprietary
  code or getting around protections.

The ECC plugin's hooks are NOT installed here. REA is a dev dependency in `webapp/` (CLI only).
