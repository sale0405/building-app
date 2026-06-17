# Chat (backend)

Conversations, messages, attachments, realtime via Socket.IO.

## Dependencies

- `core/storage` — file attachments
- `core/events/event-bus`
- Prisma `prisma/schema/chat.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/chat/conversations` | Yes |
| POST | `/api/v1/chat/conversations` | Yes |
| GET | `/api/v1/chat/conversations/:id/messages` | Yes |
| POST | `/api/v1/chat/conversations/:id/messages` | Yes |
| POST | `/api/v1/chat/conversations/:id/messages/attachment` | Yes |
| POST | `/api/v1/chat/conversations/:id/messages/:messageId/read` | Yes |

## Socket (client)

`chat:join`, `chat:leave`, `chat:typing` → `chat:message`, `chat:typing`

## Events

**Emits:** `chat.message.sent`

**Consumes:** `chore.status.changed`, `business-help.matched`

## Docs

`docs/chat/`
