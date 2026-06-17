# Chat module — API spec

Base path: `/api/v1/chat`

**Auth:** All routes require authentication.

## GET /conversations

List conversations for current user (ordered by `updatedAt` desc).

**Response 200:** `ConversationDto[]` with participants, optional `lastMessage`, `unreadCount`

## POST /conversations

Create conversation.

**Body** (`createConversationSchema`):

| Field | Type | Required |
|-------|------|----------|
| type | DIRECT \| GROUP | yes |
| participantIds | string[] (cuid) | min 1 |
| contextType | string | no |
| contextId | string (cuid) | no |

Current user added as participant automatically in service.

**Response 201:** `ConversationDto`

## GET /conversations/:id/messages

Paginated messages (newest first in DB, reversed in response).

**Query:**

| Param | Default |
|-------|---------|
| page | 1 |
| pageSize | 50 |

**Response 200:** `MessageDto[]`

## POST /conversations/:id/messages

Send text message.

**Body** (`sendMessageSchema`):

```json
{ "content": "Hello", "type": "TEXT" }
```

**Response 201:** `MessageDto`

**Side effect:** Emits `chat.message.sent`

## POST /conversations/:id/messages/attachment

Send file message.

**Content-Type:** `multipart/form-data`  
**Fields:** `file` (max 10 MB), optional `content`

**Response 201:** `MessageDto` with `type: FILE` and attachments

## POST /conversations/:id/messages/:messageId/read

Mark message read + update participant `lastReadAt`.

**Response 200:** `{ success: true }`

## Socket.IO

### Client → server

| Event | Payload |
|-------|---------|
| `chat:join` | `conversationId: string` |
| `chat:leave` | `conversationId: string` |
| `chat:typing` | `{ conversationId, isTyping }` |

### Server → client

| Event | Payload |
|-------|---------|
| `chat:message` | `MessageDto` |
| `chat:typing` | `{ conversationId, userId, isTyping }` |

Messages broadcast to `conversation:{id}` and individual `user:{recipientId}` rooms.
