import type { AvailabilityStatus, BreakLocationType, BreakType, BusinessHelpStatus, ChoreStatus, CoopAudienceType, ConversationType, FoodListingStatus, MessageType, ModerationAction, NotificationResponseAction, NotificationType, NotificationValidityMode, SmokeBreakStatus, UserRole, UrgencyLevel } from '../enums/index.js';
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    floorId?: string | null;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface FloorInfo {
    id: string;
    number: number;
    label: string;
    buildingId: string;
}
export interface UserProfileDto {
    id: string;
    userId: string;
    name: string;
    companyName: string | null;
    officeNumber: string | null;
    bio: string | null;
    photoUrl: string | null;
    availabilityStatus: AvailabilityStatus;
    floor: FloorInfo | null;
    profileComplete: boolean;
    role: UserRole;
    email: string;
    createdAt: string;
    updatedAt: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface SmokeBreakInvitationDto {
    id: string;
    creatorId: string;
    floorId: string;
    breakType: BreakType;
    locationType: BreakLocationType;
    location: string;
    durationMinutes: number;
    expiresAt: string;
    status: SmokeBreakStatus;
    creator?: UserProfileDto;
    participants?: {
        userId: string;
        joinedAt: string;
        user?: UserProfileDto;
    }[];
    createdAt: string;
}
export interface ChoreRequestDto {
    id: string;
    requesterId: string;
    floorId: string;
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    preferredTime: string | null;
    urgency: UrgencyLevel;
    audienceType: CoopAudienceType;
    targetCompanyName: string | null;
    targetUserId: string | null;
    status: ChoreStatus;
    volunteerId: string | null;
    requester?: UserProfileDto;
    volunteer?: UserProfileDto;
    targetUser?: UserProfileDto;
    createdAt: string;
}
export interface FoodListingDto {
    id: string;
    sellerId: string;
    floorId: string;
    lockerNumber: string;
    title: string;
    quantity: number;
    expirationDate: string;
    price: number;
    status: FoodListingStatus;
    photos: {
        id: string;
        url: string;
        sortOrder: number;
    }[];
    seller?: UserProfileDto;
    createdAt: string;
}
export interface BusinessHelpRequestDto {
    id: string;
    requesterId: string;
    floorId: string | null;
    category: string;
    title: string;
    description: string;
    status: BusinessHelpStatus;
    requester?: UserProfileDto;
    createdAt: string;
}
export interface ConversationDto {
    id: string;
    type: ConversationType;
    title: string | null;
    contextType: string | null;
    contextId: string | null;
    participants: UserProfileDto[];
    lastMessage?: MessageDto;
    unreadCount?: number;
    createdAt: string;
}
export interface MessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: MessageType;
    sender?: UserProfileDto;
    attachments?: {
        id: string;
        url: string;
        fileName: string;
        mimeType: string;
    }[];
    readBy?: string[];
    createdAt: string;
}
export interface NotificationDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata: Record<string, unknown>;
    createdByUserId: string | null;
    validityMode: NotificationValidityMode;
    expiresAt: string | null;
    resolvedAt: string | null;
    userResponse: NotificationResponseAction | null;
    readAt: string | null;
    createdAt: string;
}
export interface BuildingAnnouncementDto {
    id: string;
    buildingId: string;
    title: string;
    body: string;
    createdByUserId: string;
    expiresAt: string | null;
    author?: UserProfileDto;
    createdAt: string;
}
export interface AdminAnalyticsDto {
    totalUsers: number;
    usersByFloor: {
        floorId: string;
        floorLabel: string;
        count: number;
    }[];
    activeListings: number;
    openChores: number;
    messagesLast24h: number;
}
export interface AdminReportDto {
    id: string;
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: string;
}
export interface UserModerationDto {
    id: string;
    userId: string;
    action: ModerationAction;
    reason: string;
    adminId: string;
    expiresAt: string | null;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map