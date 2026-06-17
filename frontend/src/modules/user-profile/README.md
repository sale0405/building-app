# Users / Profile (frontend)

Backend module name: **users**. Frontend folder: **user-profile**.

Profile view and edit for the authenticated user.

## Dependencies

- `core/api-client`
- `modules/auth/store/auth.store` — current user state

## Routes

| Path | Page | Nav |
|------|------|-----|
| `/profile` | ProfilePage | Profile |

## API used

`GET/PATCH /users/me`, `POST /users/me/photo`

## Events

None (REST only).

## Docs

`docs/users/frontend-flow.md`
