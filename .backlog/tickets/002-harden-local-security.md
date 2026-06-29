# Harden Local Security

## Goal

Reduce the risk of leaking Gmail credentials or OAuth tokens when using this project locally.

## Scope

- Document token storage behavior and sensitivity.
- Confirm `.env` and token files remain ignored by git.
- Add clear warnings about local-only and single-user usage.
- Improve startup validation for missing or invalid OAuth configuration.

## Acceptance Criteria

- Repository docs clearly explain where tokens are stored and why they are sensitive.
- `.env` and `data/` remain ignored.
- Missing required OAuth settings produce clear startup errors.
- Security notes explain that this project is not intended for shared or hosted multi-user use.

## Notes

Keep security hardening minimal and targeted. Do not introduce multi-user auth or hosted deployment unless a separate ticket explicitly asks for it.
