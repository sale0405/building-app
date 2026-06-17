# Chat module — Overview

Direct and group messaging with file attachments and context-linked conversations.

## Purpose

- Create conversations (direct/group) with optional business context
- Send text and file messages
- Read receipts and message history
- Realtime delivery via Socket.IO
- Auto-create conversations when chores are accepted or business help is matched

## Boundaries

**Owns:**

- Conversation, Message, Attachment, ReadReceipt models
- Chat REST API and message send logic
- Socket room management for conversations (`chat:join`, `chat:leave`, `chat:typing`)

**Does not own:**

- User profiles → uses `toUserProfileDto`
- Push/in-app alerts → `notifications` listens to `chat.message.sent`

## Dependencies

| Dependency | Usage |
|------------|-------|
| `core/storage` | File attachments |
| `core/events/event-bus` | Emit `chat.message.sent`; listen for chore/business-help |
| `users/dto` | Participant profiles |

## Key files

```
backend/src/modules/chat/
├── index.ts              # Routes + event listeners for auto-conversations
├── routes/chat.routes.ts
├── controllers/chat.controller.ts
└── services/chat.service.ts
```

## Events

| Direction | Event |
|-----------|-------|
| Emits | `chat.message.sent` |
| Consumes | `chore.status.changed` (when volunteerId set), `business-help.matched` |

Auto-conversations use `contextType`: `chore` | `business-help` and `contextId`.
