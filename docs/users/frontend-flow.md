# Users module — Frontend flow

Frontend path: `frontend/src/modules/user-profile/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/profile` | `ProfilePage` | "Profile" |

Default post-login destination via `HomeRedirect`.

## Data loading

- On app init, `useAuthStore.loadUser()` calls `GET /users/me`.
- Profile page displays and edits current user fields.
- Photo upload via multipart POST to `/users/me/photo`.

## State

No dedicated Zustand store — profile lives in `useAuthStore.user` (`UserProfileDto`).

After profile update, page should refresh auth store user or PATCH response updates local state.

## Floor display

Profile shows `user.floor.label` and building context from nested `FloorInfo`.

## Dependencies

- `apiClient` for REST
- `useAuthStore` for current user

## Module registration

```typescript
moduleRegistry.register({
  routes: [{ path: '/profile', element: <ProfilePage /> }],
  navItems: [{ label: 'Profile', path: '/profile' }],
});
```

## Future UI

- User directory browser with floor filter
- View other user profiles from chat/chores links
