# Chat module — Tasks

## Done

- [x] Conversations CRUD (list, create)
- [x] Text and file messages
- [x] Read receipts
- [x] Socket realtime + typing
- [x] Auto-conversation on chore volunteer + business match
- [x] System messages for status updates
- [x] ChatPage UI

## Backlog

- [ ] Frontend socket listeners in ChatPage (wire `chat:message`, `chat:typing`)
- [ ] Unread count badge in AppLayout nav
- [ ] Message pagination infinite scroll
- [ ] DIRECT conversation deduplication (same two users)
- [ ] Message edit/delete
- [ ] E2E encryption (out of scope unless requested)
- [ ] `chat:read` socket event (defined in shared types, not wired in gateway)

## Auto-conversation rules

| Trigger | Condition | contextType |
|---------|-----------|-------------|
| `chore.status.changed` | `volunteerId` present | `chore` |
| `business-help.matched` | always | `business-help` |

System message sent on creation/status change.
