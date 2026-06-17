# Auth module — Tasks

## Done

- [x] JWT access + refresh token pair with rotation
- [x] Register with floor selection and role
- [x] Login / logout
- [x] Forgot / reset password (dev token exposure)
- [x] GET /floors for registration
- [x] Emit `user.registered` event
- [x] Frontend auth store with token persistence
- [x] GuestGuard for login/register routes
- [x] Backend auth tests (`auth.test.ts`)

## Backlog

- [ ] Email delivery for password reset (currently dev-only token)
- [ ] Rate limiting on login/register endpoints
- [ ] OAuth / SSO for enterprise tenants
- [ ] Email verification on register
- [ ] Remember-me / longer refresh for PWA
- [ ] Secure httpOnly cookie option alongside localStorage

## Acceptance criteria template

When adding auth features:

1. Zod schema in `@building-app/shared`
2. Route + controller + service + repository
3. Update `docs/auth/api-spec.md`
4. Frontend store/page updates + test
5. No direct imports from other modules
