# Smoke Break (frontend)

Create and join floor break invitations.

## Dependencies

- `core/api-client`
- `core/socket-client` — floor room receives `smoke-break:invitation`
- `modules/auth/store` — `user.floorId`

## Routes

| Path | Page | Nav |
|------|------|-----|
| `/smoke-break` | SmokeBreakPage | Breaks |

## API used

`GET/POST/DELETE /smoke-break/invitations`, `POST .../join`

## Socket events

**Listen:** `smoke-break:invitation`, `smoke-break:joined`

## Docs

`docs/smoke-break/frontend-flow.md`
