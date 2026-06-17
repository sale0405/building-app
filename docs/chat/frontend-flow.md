# Chat module — Frontend flow

Frontend path: `frontend/src/modules/chat/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/chat` | `ChatPage` | "Chat" |

## Socket helpers (`core/socket-client.ts`)

| Function | Purpose |
|----------|---------|
| `joinConversation(id)` | Emit `chat:join` |
| `leaveConversation(id)` | Emit `chat:leave` |
| `sendTyping(id, bool)` | Typing indicator |

## Typical page flow

1. Load conversations: `GET /chat/conversations`
2. Select conversation → `joinConversation(id)`
3. Load messages: `GET /chat/conversations/:id/messages`
4. Listen for `chat:message` on socket → append to thread
5. Send message: POST or attachment endpoint
6. On unmount → `leaveConversation(id)`

## State

`ChatPage` currently manages state locally (no global Zustand store). Consider extracting `useChatStore` for unread counts across nav.

## Integration points

- Notifications module receives `CHAT` type for offline users
- Chore/business-help flows create conversations server-side — user sees new thread on next conversation list fetch

## Auth dependency

Socket must be connected (`connectSocket` from auth store) before realtime features work.

## Future enhancements

- Optimistic message send
- Unread badge in nav from conversation list
- Link from chore/food listing to open context conversation
