# Chat (frontend)

Messaging UI with conversation list and thread.

## Dependencies

- `core/api-client`
- `core/socket-client` — join/leave/typing helpers

## Routes

| Path | Page | Nav |
|------|------|-----|
| `/chat` | ChatPage | Chat |

## API used

`/chat/conversations`, `/chat/conversations/:id/messages`, message POST endpoints

## Socket events

**Emit:** `chat:join`, `chat:leave`, `chat:typing`  
**Listen:** `chat:message`, `chat:typing` (wire in page — backlog)

## Docs

`docs/chat/frontend-flow.md`
