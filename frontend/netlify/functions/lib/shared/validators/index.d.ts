import { z } from 'zod';
import { AvailabilityStatus, BreakLocationType, BreakType, ChoreStatus, CoopAudienceType, UrgencyLevel, UserRole } from '../enums/index.js';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}, {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    officeNumber: z.ZodOptional<z.ZodString>;
    floorId: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    availabilityStatus: z.ZodOptional<z.ZodNativeEnum<typeof AvailabilityStatus>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    companyName?: string | undefined;
    officeNumber?: string | undefined;
    floorId?: string | undefined;
    bio?: string | undefined;
    availabilityStatus?: AvailabilityStatus | undefined;
}, {
    name?: string | undefined;
    companyName?: string | undefined;
    officeNumber?: string | undefined;
    floorId?: string | undefined;
    bio?: string | undefined;
    availabilityStatus?: AvailabilityStatus | undefined;
}>;
export declare const createSmokeBreakSchema: z.ZodObject<{
    floorId: z.ZodString;
    breakType: z.ZodNativeEnum<typeof BreakType>;
    locationType: z.ZodNativeEnum<typeof BreakLocationType>;
    durationMinutes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    floorId: string;
    breakType: BreakType;
    locationType: BreakLocationType;
    durationMinutes: number;
}, {
    floorId: string;
    breakType: BreakType;
    locationType: BreakLocationType;
    durationMinutes: number;
}>;
export declare const createChoreSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    helpType: z.ZodString;
    estimatedDuration: z.ZodNumber;
    preferredTime: z.ZodOptional<z.ZodString>;
    urgency: z.ZodNativeEnum<typeof UrgencyLevel>;
    floorId: z.ZodOptional<z.ZodString>;
    audienceType: z.ZodDefault<z.ZodNativeEnum<typeof CoopAudienceType>>;
    targetCompanyName: z.ZodOptional<z.ZodString>;
    targetUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    urgency: UrgencyLevel;
    audienceType: CoopAudienceType;
    floorId?: string | undefined;
    preferredTime?: string | undefined;
    targetCompanyName?: string | undefined;
    targetUserId?: string | undefined;
}, {
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    urgency: UrgencyLevel;
    floorId?: string | undefined;
    preferredTime?: string | undefined;
    audienceType?: CoopAudienceType | undefined;
    targetCompanyName?: string | undefined;
    targetUserId?: string | undefined;
}>, {
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    urgency: UrgencyLevel;
    audienceType: CoopAudienceType;
    floorId?: string | undefined;
    preferredTime?: string | undefined;
    targetCompanyName?: string | undefined;
    targetUserId?: string | undefined;
}, {
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    urgency: UrgencyLevel;
    floorId?: string | undefined;
    preferredTime?: string | undefined;
    audienceType?: CoopAudienceType | undefined;
    targetCompanyName?: string | undefined;
    targetUserId?: string | undefined;
}>;
export declare const updateChoreStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof ChoreStatus>;
}, "strip", z.ZodTypeAny, {
    status: ChoreStatus;
}, {
    status: ChoreStatus;
}>;
export declare const createFoodListingSchema: z.ZodObject<{
    floorId: z.ZodString;
    lockerNumber: z.ZodString;
    title: z.ZodString;
    quantity: z.ZodNumber;
    expirationDate: z.ZodString;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    floorId: string;
    title: string;
    lockerNumber: string;
    quantity: number;
    expirationDate: string;
    price: number;
}, {
    floorId: string;
    title: string;
    lockerNumber: string;
    quantity: number;
    expirationDate: string;
    price: number;
}>;
export declare const createBusinessHelpRequestSchema: z.ZodObject<{
    floorId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: string;
    floorId?: string | undefined;
}, {
    title: string;
    description: string;
    category: string;
    floorId?: string | undefined;
}>;
export declare const createBusinessHelpOfferSchema: z.ZodObject<{
    requestId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: string;
    requestId?: string | undefined;
}, {
    title: string;
    description: string;
    category: string;
    requestId?: string | undefined;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["TEXT", "SYSTEM", "FILE"]>>;
}, "strip", z.ZodTypeAny, {
    type: "SYSTEM" | "TEXT" | "FILE";
    content: string;
}, {
    content: string;
    type?: "SYSTEM" | "TEXT" | "FILE" | undefined;
}>;
export declare const createConversationSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["DIRECT", "GROUP"]>;
    participantIds: z.ZodArray<z.ZodString, "many">;
    title: z.ZodOptional<z.ZodString>;
    contextType: z.ZodOptional<z.ZodString>;
    contextId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "DIRECT" | "GROUP";
    participantIds: string[];
    title?: string | undefined;
    contextType?: string | undefined;
    contextId?: string | undefined;
}, {
    type: "DIRECT" | "GROUP";
    participantIds: string[];
    title?: string | undefined;
    contextType?: string | undefined;
    contextId?: string | undefined;
}>, {
    type: "DIRECT" | "GROUP";
    participantIds: string[];
    title?: string | undefined;
    contextType?: string | undefined;
    contextId?: string | undefined;
}, {
    type: "DIRECT" | "GROUP";
    participantIds: string[];
    title?: string | undefined;
    contextType?: string | undefined;
    contextId?: string | undefined;
}>;
export declare const startDirectChatSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export declare const pushSubscriptionSchema: z.ZodObject<{
    endpoint: z.ZodString;
    keys: z.ZodObject<{
        p256dh: z.ZodString;
        auth: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        auth: string;
        p256dh: string;
    }, {
        auth: string;
        p256dh: string;
    }>;
}, "strip", z.ZodTypeAny, {
    keys: {
        auth: string;
        p256dh: string;
    };
    endpoint: string;
}, {
    keys: {
        auth: string;
        p256dh: string;
    };
    endpoint: string;
}>;
export declare const createReportSchema: z.ZodObject<{
    targetType: z.ZodString;
    targetId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetType: string;
    targetId: string;
    reason: string;
}, {
    targetType: string;
    targetId: string;
    reason: string;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const createNotificationSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    validityMode: z.ZodEnum<["TIMED", "UNTIL_RESOLVED"]>;
    expiresAt: z.ZodOptional<z.ZodString>;
    floorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    body: string;
    validityMode: "TIMED" | "UNTIL_RESOLVED";
    floorId?: string | undefined;
    expiresAt?: string | undefined;
}, {
    title: string;
    body: string;
    validityMode: "TIMED" | "UNTIL_RESOLVED";
    floorId?: string | undefined;
    expiresAt?: string | undefined;
}>, {
    title: string;
    body: string;
    validityMode: "TIMED" | "UNTIL_RESOLVED";
    floorId?: string | undefined;
    expiresAt?: string | undefined;
}, {
    title: string;
    body: string;
    validityMode: "TIMED" | "UNTIL_RESOLVED";
    floorId?: string | undefined;
    expiresAt?: string | undefined;
}>;
export declare const notificationResponseSchema: z.ZodObject<{
    action: z.ZodEnum<["ACKNOWLEDGE", "INTERESTED", "DECLINE", "VIEW"]>;
}, "strip", z.ZodTypeAny, {
    action: "ACKNOWLEDGE" | "INTERESTED" | "DECLINE" | "VIEW";
}, {
    action: "ACKNOWLEDGE" | "INTERESTED" | "DECLINE" | "VIEW";
}>;
export declare const createBuildingAnnouncementSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    body: string;
    expiresAt?: string | undefined;
}, {
    title: string;
    body: string;
    expiresAt?: string | undefined;
}>, {
    title: string;
    body: string;
    expiresAt?: string | undefined;
}, {
    title: string;
    body: string;
    expiresAt?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=index.d.ts.map