# Smoke Break module — Tasks

## Done

- [x] Create/list/join/cancel invitations
- [x] Floor-scoped listing with expiry filter
- [x] Domain events + socket floor broadcast
- [x] Participant tracking
- [x] SmokeBreakPage UI

## Backlog

- [ ] Frontend socket listener for live invitation feed
- [ ] Scheduled job to set status EXPIRED
- [ ] Push notification to all floor users (not just creator confirmation)
- [ ] Map/location picker for break spot
- [ ] Max participants limit
- [ ] Reminder notification before expiry

## Testing checklist

- Create on Floor 1 visible to Floor 1 users only
- Join idempotency
- Cancel only by creator
- Expired invitations excluded from list
