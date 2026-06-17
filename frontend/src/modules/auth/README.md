# Auth (frontend)

Login, registration, JWT session, and Socket.IO connect on auth.

## Dependencies

- `core/api-client` — token storage and refresh
- `core/socket-client` — connect on login/init
- `core/module-registry`, `core/auth-guard`

## Routes

| Path | Page |
|------|------|
| `/login` | LoginPage |
| `/register` | RegisterPage |

## Store

`store/auth.store.ts` — `useAuthStore` (login, register, logout, init)

## API used

`/auth/floors`, `/auth/login`, `/auth/register`, `/auth/logout`, `/users/me`

## Events

Socket connects with JWT; no direct event bus on frontend.

## Docs

`docs/auth/frontend-flow.md`
