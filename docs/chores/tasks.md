# Chores module — Tasks

## Done

- [x] CRUD for chore requests
- [x] Volunteer flow OPEN → ACCEPTED
- [x] Status history audit trail
- [x] Floor scoping on create and list
- [x] Domain events for notifications + chat
- [x] ChoresPage UI

## Backlog

- [ ] Authorization: only requester/volunteer can update status
- [ ] Soft delete / cancel by requester
- [ ] Link from chore card to context chat conversation
- [ ] Filter UI by urgency and status tabs
- [ ] Rating volunteer after COMPLETED
- [ ] Scheduled reminder for preferredTime

## Business rules to enforce

- Volunteer only when OPEN and not own request
- Valid status transitions (prevent OPEN after ACCEPTED without cancel)
