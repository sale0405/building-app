import type {
  AuthUser,
  BuildingAnnouncementDto,
  ChoreRequestDto,
  FoodListingDto,
  MessageDto,
  NotificationDto,
  SmokeBreakInvitationDto,
  UserProfileDto,
} from '../types/index.js';

export interface DomainEventMap {
  'user.registered': { userId: string; email: string; role: string; floorId: string };
  'smoke-break.invitation.created': { invitation: SmokeBreakInvitationDto; floorId: string };
  'smoke-break.participant.joined': {
    invitationId: string;
    userId: string;
    creatorId: string;
  };
  'chore.request.created': { chore: ChoreRequestDto; floorId: string; notifyUserIds: string[] };
  'chore.status.changed': {
    choreId: string;
    status: string;
    requesterId: string;
    volunteerId: string | null;
  };
  'food-locker.listing.created': { listing: FoodListingDto; floorId: string };
  'food-locker.item.reserved': { listingId: string; buyerId: string; sellerId: string };
  'food-locker.item.sold': { listingId: string; buyerId: string; sellerId: string };
  'business-help.matched': {
    requestId: string;
    offerId: string;
    requesterId: string;
    offererId: string;
  };
  'chat.message.sent': { message: MessageDto; recipientIds: string[] };
  'admin.listing.removed': { listingId: string; sellerId: string; adminId: string };
  'notification.created': { notification: NotificationDto };
  'building-announcement.created': { announcement: BuildingAnnouncementDto; userIds: string[] };
}

export type DomainEventName = keyof DomainEventMap;

export type DomainEventPayload<T extends DomainEventName> = DomainEventMap[T];

export interface SocketEvents {
  'notification:new': NotificationDto;
  'smoke-break:invitation': SmokeBreakInvitationDto;
  'smoke-break:joined': { invitationId: string; userId: string };
  'chat:message': MessageDto;
  'chat:typing': { conversationId: string; userId: string; isTyping: boolean };
  'chat:read': { conversationId: string; messageId: string; userId: string };
}

export interface AuthenticatedSocketData {
  user: AuthUser;
}
