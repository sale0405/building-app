import { useEffect, useRef, useState } from 'react';
import type { ConversationDto, MessageDto, UserProfileDto } from '@building-app/shared';
import { ConversationType } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { t } from '../../../core/i18n/index.js';
import { getSocket, joinConversation, sendTyping } from '../../../core/socket-client.js';
import { useAuthStore } from '../../auth/store/auth.store.js';
import { formatUserLabel, getConversationLabel, getConversationSubtitle } from '../utils/chat-ui.js';

export function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [groupMode, setGroupMode] = useState(false);
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const loadUsers = () => {
    apiClient.get<UserProfileDto[]>('/chat/users').then((res) => {
      if (res.success && res.data) setUsers(res.data);
    });
  };

  const loadConversations = () => {
    apiClient.get<ConversationDto[]>('/chat/conversations').then((res) => {
      if (res.success && res.data) setConversations(res.data);
    });
  };

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selected) return;
    joinConversation(selected);
    apiClient.get<MessageDto[]>(`/chat/conversations/${selected}/messages`).then((res) => {
      if (res.success && res.data) setMessages(res.data);
    });

    const socket = getSocket();
    const onMessage = (msg: MessageDto) => {
      if (msg.conversationId === selected) {
        setMessages((m) => [...m, msg]);
      }
      loadConversations();
    };
    const onTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === selected && data.userId !== user?.userId) {
        setTyping(data.isTyping ? t('chat.typing') : null);
      }
    };
    socket?.on('chat:message', onMessage);
    socket?.on('chat:typing', onTyping);
    return () => {
      socket?.off('chat:message', onMessage);
      socket?.off('chat:typing', onTyping);
    };
  }, [selected, user?.userId]);

  const openConversation = (conversation: ConversationDto) => {
    setSelected(conversation.id);
    setGroupMode(false);
    setGroupSelection([]);
  };

  const startDirectChat = async (otherUserId: string) => {
    const res = await apiClient.post<ConversationDto>('/chat/conversations/direct', { userId: otherUserId });
    if (res.success && res.data) {
      loadConversations();
      openConversation(res.data);
    }
  };

  const toggleGroupMember = (userId: string) => {
    setGroupSelection((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const createGroupChat = async () => {
    if (groupSelection.length < 2) return;
    setCreatingGroup(true);
    const res = await apiClient.post<ConversationDto>('/chat/conversations', {
      type: ConversationType.GROUP,
      participantIds: groupSelection,
      title: groupTitle.trim() || undefined,
    });
    setCreatingGroup(false);
    if (res.success && res.data) {
      setGroupMode(false);
      setGroupSelection([]);
      setGroupTitle('');
      loadConversations();
      openConversation(res.data);
    }
  };

  const sendMessage = async () => {
    if (!selected || !input.trim()) return;
    await apiClient.post(`/chat/conversations/${selected}/messages`, { content: input });
    setInput('');
    sendTyping(selected, false);
    loadConversations();
  };

  const handleInput = (value: string) => {
    setInput(value);
    if (selected) {
      sendTyping(selected, true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => sendTyping(selected!, false), 2000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.officeNumber ?? '').toLowerCase().includes(query) ||
      (u.floor?.label ?? '').toLowerCase().includes(query)
    );
  });

  const activeConversation = conversations.find((c) => c.id === selected) ?? null;

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      <div className="w-72 shrink-0 card flex flex-col overflow-hidden">
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-semibold">{t('chat.people')}</h2>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded ${groupMode ? 'bg-primary text-white' : 'bg-white/60'}`}
              onClick={() => {
                setGroupMode((v) => !v);
                setGroupSelection([]);
              }}
            >
              {groupMode ? t('chat.cancelGroup') : t('chat.newGroup')}
            </button>
          </div>
          <input
            className="input text-sm"
            placeholder={t('chat.searchUsers')}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 mb-4">
          {filteredUsers.length === 0 && <p className="text-xs text-gray-500">{t('chat.noUsers')}</p>}
          {filteredUsers.map((u) => {
            const selectedForGroup = groupSelection.includes(u.userId);
            return (
              <div
                key={u.userId}
                className={`rounded-lg p-2 text-sm ${
                  selectedForGroup ? 'bg-primary/15 border border-primary/30' : 'hover:bg-white/50'
                }`}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500 truncate">{formatUserLabel(u)}</div>
                <div className="mt-2 flex gap-2">
                  {groupMode ? (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => toggleGroupMember(u.userId)}
                    >
                      {selectedForGroup ? t('chat.selected') : t('chat.addToGroup')}
                    </button>
                  ) : (
                    <button type="button" className="btn-primary text-xs" onClick={() => startDirectChat(u.userId)}>
                      {t('chat.message')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {groupMode && (
          <div className="border-t border-white/30 pt-3 space-y-2">
            <input
              className="input text-sm"
              placeholder={t('chat.groupName')}
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
            />
            <p className="text-xs text-gray-500">{t('chat.groupSelected', { count: groupSelection.length })}</p>
            <button
              type="button"
              className="btn-primary w-full text-sm"
              disabled={groupSelection.length < 2 || creatingGroup}
              onClick={createGroupChat}
            >
              {creatingGroup ? t('chat.creatingGroup') : t('chat.createGroup')}
            </button>
          </div>
        )}

        <div className="border-t border-white/30 pt-3 mt-3 flex-1 overflow-y-auto min-h-0">
          <h2 className="font-semibold mb-2">{t('chat.chats')}</h2>
          {conversations.length === 0 && <p className="text-xs text-gray-500">{t('chat.noChats')}</p>}
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openConversation(c)}
              className={`block w-full text-left p-2 rounded-lg text-sm mb-1 ${
                selected === c.id ? 'bg-primary/15 text-primary' : 'hover:bg-white/50'
              }`}
            >
              <div className="font-medium truncate">
                {user ? getConversationLabel(c, user.userId) : t('nav.chat')}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.type === ConversationType.GROUP ? `${t('chat.group')} · ` : ''}
                {user ? getConversationSubtitle(c, user.userId) : ''}
              </div>
              {c.lastMessage && (
                <div className="text-xs text-gray-400 truncate mt-1">{c.lastMessage.content}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 card flex flex-col min-w-0">
        {activeConversation && user ? (
          <>
            <div className="border-b border-white/30 pb-3 mb-3">
              <h2 className="font-semibold">{getConversationLabel(activeConversation, user.userId)}</h2>
              <p className="text-sm text-gray-500">
                {activeConversation.type === ConversationType.GROUP ? `${t('chat.groupChat')} · ` : `${t('chat.directChat')} · `}
                {getConversationSubtitle(activeConversation, user.userId)}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === user.userId ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%]">
                    {activeConversation.type === ConversationType.GROUP && m.senderId !== user.userId && (
                      <p className="text-xs text-gray-500 mb-1">{m.sender?.name ?? t('chat.userFallback')}</p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        m.senderId === user.userId
                          ? 'bg-primary/90 text-white'
                          : 'bg-white/70 backdrop-blur-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {typing && <p className="text-xs text-gray-400">{typing}</p>}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('chat.typeMessage')}
              />
              <button type="button" className="btn-primary" onClick={sendMessage}>
                {t('common.send')}
              </button>
            </div>
          </>
        ) : (
          <div className="m-auto text-center text-gray-500 px-6">
            <p className="font-medium mb-2">{t('chat.startTitle')}</p>
            <p className="text-sm">{t('chat.startHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
