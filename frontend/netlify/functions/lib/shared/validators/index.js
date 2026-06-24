import { z } from 'zod';
import { AvailabilityStatus, BreakLocationType, BreakType, ChoreStatus, CoopAudienceType, UrgencyLevel, UserRole, } from '../enums/index.js';
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
});
export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    companyName: z.string().max(200).optional(),
    officeNumber: z.string().min(1).optional(),
    floorId: z.string().cuid().optional(),
    bio: z.string().max(500).optional(),
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
});
export const createSmokeBreakSchema = z.object({
    floorId: z.string().cuid(),
    breakType: z.nativeEnum(BreakType),
    locationType: z.nativeEnum(BreakLocationType),
    durationMinutes: z.number().int().min(5).max(120),
});
export const createChoreSchema = z
    .object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    helpType: z.string().min(1).max(100),
    estimatedDuration: z.number().int().min(5).max(480),
    preferredTime: z.string().datetime().optional(),
    urgency: z.nativeEnum(UrgencyLevel),
    floorId: z.string().cuid().optional(),
    audienceType: z.nativeEnum(CoopAudienceType).default(CoopAudienceType.OPEN),
    targetCompanyName: z.string().min(1).max(200).optional(),
    targetUserId: z.string().cuid().optional(),
})
    .superRefine((data, ctx) => {
    if (data.audienceType === CoopAudienceType.OTHER_COMPANY && !data.targetCompanyName?.trim()) {
        ctx.addIssue({
            code: 'custom',
            message: 'targetCompanyName is required for other-company CO-OP',
            path: ['targetCompanyName'],
        });
    }
    if (data.audienceType === CoopAudienceType.SPECIFIC_USER && !data.targetUserId) {
        ctx.addIssue({
            code: 'custom',
            message: 'targetUserId is required for user-targeted CO-OP',
            path: ['targetUserId'],
        });
    }
});
export const updateChoreStatusSchema = z.object({
    status: z.nativeEnum(ChoreStatus),
});
export const createFoodListingSchema = z.object({
    floorId: z.string().cuid(),
    lockerNumber: z.string().min(1).max(20),
    title: z.string().min(2).max(200),
    quantity: z.number().int().min(1),
    expirationDate: z.string().datetime(),
    price: z.number().min(0),
});
export const createBusinessHelpRequestSchema = z.object({
    floorId: z.string().cuid().optional(),
    category: z.string().min(1).max(100),
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
});
export const createBusinessHelpOfferSchema = z.object({
    requestId: z.string().cuid().optional(),
    category: z.string().min(1).max(100),
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
});
export const sendMessageSchema = z.object({
    content: z.string().min(1).max(5000),
    type: z.enum(['TEXT', 'SYSTEM', 'FILE']).default('TEXT'),
});
export const createConversationSchema = z
    .object({
    type: z.enum(['DIRECT', 'GROUP']),
    participantIds: z.array(z.string().cuid()).min(1),
    title: z.string().min(1).max(100).optional(),
    contextType: z.string().optional(),
    contextId: z.string().cuid().optional(),
})
    .superRefine((data, ctx) => {
    if (data.type === 'DIRECT' && data.participantIds.length !== 1) {
        ctx.addIssue({
            code: 'custom',
            message: 'Direct chats require exactly one other participant',
            path: ['participantIds'],
        });
    }
    if (data.type === 'GROUP' && data.participantIds.length < 2) {
        ctx.addIssue({
            code: 'custom',
            message: 'Group chats require at least two other participants',
            path: ['participantIds'],
        });
    }
});
export const startDirectChatSchema = z.object({
    userId: z.string().cuid(),
});
export const pushSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});
export const createReportSchema = z.object({
    targetType: z.string().min(1),
    targetId: z.string().cuid(),
    reason: z.string().min(10).max(1000),
});
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(20),
});
export const createNotificationSchema = z
    .object({
    title: z.string().min(3).max(200),
    body: z.string().min(5).max(2000),
    validityMode: z.enum(['TIMED', 'UNTIL_RESOLVED']),
    expiresAt: z.string().datetime().optional(),
    floorId: z.string().cuid().optional(),
})
    .superRefine((data, ctx) => {
    if (data.validityMode === 'TIMED') {
        if (!data.expiresAt) {
            ctx.addIssue({ code: 'custom', message: 'expiresAt is required for timed notifications', path: ['expiresAt'] });
            return;
        }
        if (new Date(data.expiresAt) <= new Date()) {
            ctx.addIssue({ code: 'custom', message: 'expiresAt must be in the future', path: ['expiresAt'] });
        }
    }
});
export const notificationResponseSchema = z.object({
    action: z.enum(['ACKNOWLEDGE', 'INTERESTED', 'DECLINE', 'VIEW']),
});
export const createBuildingAnnouncementSchema = z
    .object({
    title: z.string().min(3).max(200),
    body: z.string().min(5).max(5000),
    expiresAt: z.string().datetime().optional(),
})
    .superRefine((data, ctx) => {
    if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
        ctx.addIssue({ code: 'custom', message: 'expiresAt must be in the future', path: ['expiresAt'] });
    }
});
