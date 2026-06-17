# Users module — Tasks

## Done

- [x] GET/PATCH /users/me
- [x] Profile photo upload (5 MB limit)
- [x] List users with floor filter
- [x] GET /users/:id
- [x] UserProfileDto mapper used across backend
- [x] Profile page in frontend
- [x] Availability status field

## Backlog

- [ ] Dedicated user directory page with search
- [ ] Public profile view route `/users/:id`
- [ ] React to `user.registered` with analytics or onboarding checklist
- [ ] Image cropping before upload
- [ ] Cache profile in React Query for stale-while-revalidate

## Notes

When extending profile fields:

1. Add to Prisma `UserProfile`
2. Extend `updateProfileSchema` in shared
3. Update `toUserProfileDto` and `UserProfileDto` type
4. Update ProfilePage form
