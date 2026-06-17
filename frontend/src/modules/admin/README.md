# Admin (frontend)

Building admin dashboard — users, analytics, moderation.

## Dependencies

- `core/api-client`
- `modules/auth/store` — role check for nav visibility

## Routes

| Path | Page | Nav |
|------|------|-----|
| `/admin` | AdminPage | Admin (adminOnly) |

## API used

`/admin/users`, `/admin/users/:id/disable`, `/admin/listings/:id`, `/admin/reports`, `/admin/analytics`, `/reports`

## Events

None on frontend.

## Docs

`docs/admin/frontend-flow.md`
