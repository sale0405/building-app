import type { ConversationDto, UserProfileDto } from '@building-app/shared';
import { ConversationType } from '@building-app/shared';
import { formatUserLocation, t } from '../../../core/i18n/index.js';

export function formatUserLabel(user: UserProfileDto): string {
  const location = formatUserLocation(user.floor?.label, user.officeNumber);
  return `${user.name} (${location})`;
}

export function getConversationLabel(conversation: ConversationDto, currentUserId: string): string {
  if (conversation.type === ConversationType.GROUP) {
    return conversation.title ?? t('chat.groupCount', { count: conversation.participants.length });
  }

  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  return other ? formatUserLabel(other) : t('chat.directChatLabel');
}

export function getConversationSubtitle(conversation: ConversationDto, currentUserId: string): string {
  if (conversation.type === ConversationType.GROUP) {
    return conversation.participants
      .filter((p) => p.userId !== currentUserId)
      .map((p) => p.name)
      .join(', ');
  }

  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  if (!other) return t('chat.directChatLabel');
  return other.floor?.label
    ? formatUserLocation(other.floor.label, other.officeNumber)
    : other.email;
}
