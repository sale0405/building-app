# Auth module — Frontend flow

Frontend path: `frontend/src/modules/auth/`

## Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | `LoginPage` | GuestGuard |
| `/register` | `RegisterPage` | GuestGuard |

Home redirect (`HomeRedirect`) sends authenticated users to `/profile`.

## State: `auth.store.ts`

Zustand store (`useAuthStore`):

| State / action | Behavior |
|----------------|----------|
| `init()` | Load tokens from localStorage → `loadUser()` → `connectSocket()` |
| `login(email, password)` | POST `/auth/login`, save tokens, set user, connect socket |
| `register(data)` | POST `/auth/register`, same as login |
| `logout()` | POST `/auth/logout`, clear tokens, disconnect socket |
| `loadUser()` | GET `/users/me` — validates session |

## Token storage

`apiClient` persists `accessToken` and `refreshToken` in `localStorage`. Automatic refresh on 401.

## Register flow

1. `RegisterPage` fetches `GET /auth/floors` on mount.
2. User selects floor, role, enters profile fields.
3. On success → authenticated → redirect to `/profile`.

## Login flow

1. `LoginPage` submits credentials.
2. On success → Socket.IO connects with `auth: { token: accessToken }`.
3. User lands on `/profile` via home redirect.

## Socket integration

`connectSocket()` called after login/register/init when access token exists. Disconnect on logout.

## Navigation

Auth module registers no nav items. Profile and other modules provide nav after login.

## Tests

`frontend/src/modules/auth/tests/LoginPage.test.tsx` — login form rendering and interaction.
