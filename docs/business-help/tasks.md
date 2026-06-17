# Business Help module — Tasks

## Done

- [x] Requests and offers CRUD
- [x] Match creation with transactional status updates
- [x] Meeting scheduling
- [x] Domain event for chat + notifications
- [x] BusinessHelpPage UI

## Backlog

- [ ] Role-based matching (only BUILDING_ADMIN or requester can match)
- [ ] Offer discovery filtered by category
- [ ] Email/meeting calendar export (.ics)
- [ ] Complete/close request workflow in UI
- [ ] Prevent double-match on same request
- [ ] Search and filter by category/floor

## Match acceptance criteria

- Request must be OPEN
- Offer must be unmatched (`requestId` null)
- Both users receive notification + chat thread
