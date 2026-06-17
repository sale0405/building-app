# Chat module — Database schema

Schema file: `backend/prisma/schema/chat.prisma`

## Enums

### ConversationType

`DIRECT`, `GROUP`, `SYSTEM`

### MessageType

`TEXT`, `SYSTEM`, `FILE`

## Models

### Conversation

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| type | ConversationType | |
| contextType | String? | e.g. `chore`, `business-help` |
| contextId | String? | Related entity ID |
| createdAt, updatedAt | DateTime | |

### ConversationParticipant

| Field | Type | Notes |
|-------|------|-------|
| conversationId | String | FK |
| userId | String | FK |
| lastReadAt | DateTime? | Conversation-level read cursor |

Unique: `(conversationId, userId)`

### Message

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| conversationId | String | FK |
| senderId | String | FK → User |
| content | String | Text or filename for FILE |
| type | MessageType | Default TEXT |
| deletedAt | DateTime? | Soft delete |
| createdAt, updatedAt | DateTime | |

### MessageAttachment

| Field | Type | Notes |
|-------|------|-------|
| messageId | String | FK |
| storageKey | String | |
| mimeType | String | |
| fileName | String | |

### MessageReadReceipt

| Field | Type | Notes |
|-------|------|-------|
| messageId | String | FK |
| userId | String | FK |
| readAt | DateTime | |

Unique: `(messageId, userId)`

## Relationships

```
Conversation 1──* ConversationParticipant *──1 User
Conversation 1──* Message 1──* MessageAttachment
Message 1──* MessageReadReceipt
```

No `floorId` on conversations — membership defines access.
