export declare enum UserRole {
    RESIDENT = "RESIDENT",
    BUSINESS_USER = "BUSINESS_USER",
    BUILDING_ADMIN = "BUILDING_ADMIN"
}
export declare enum AvailabilityStatus {
    AVAILABLE = "AVAILABLE",
    BUSY = "BUSY",
    AWAY = "AWAY",
    OFFLINE = "OFFLINE"
}
export declare enum SmokeBreakStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare enum BreakType {
    SMOKE = "SMOKE",
    COFFEE = "COFFEE"
}
export declare enum BreakLocationType {
    TERRACE = "TERRACE",
    KITCHEN = "KITCHEN",
    COFFEE_SHOP = "COFFEE_SHOP"
}
export declare enum ChoreStatus {
    OPEN = "OPEN",
    ACCEPTED = "ACCEPTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum CoopAudienceType {
    OPEN = "OPEN",
    MY_COMPANY = "MY_COMPANY",
    OTHER_COMPANY = "OTHER_COMPANY",
    SPECIFIC_USER = "SPECIFIC_USER"
}
export declare enum FoodListingStatus {
    AVAILABLE = "AVAILABLE",
    RESERVED = "RESERVED",
    SOLD = "SOLD",
    EXPIRED = "EXPIRED"
}
export declare enum BusinessHelpStatus {
    OPEN = "OPEN",
    MATCHED = "MATCHED",
    COMPLETED = "COMPLETED",
    CLOSED = "CLOSED"
}
export declare enum ConversationType {
    DIRECT = "DIRECT",
    GROUP = "GROUP",
    SYSTEM = "SYSTEM"
}
export declare enum MessageType {
    TEXT = "TEXT",
    SYSTEM = "SYSTEM",
    FILE = "FILE"
}
export declare enum NotificationType {
    SMOKE_BREAK = "SMOKE_BREAK",
    CHORE = "CHORE",
    FOOD_LOCKER = "FOOD_LOCKER",
    BUSINESS_HELP = "BUSINESS_HELP",
    CHAT = "CHAT",
    SYSTEM = "SYSTEM",
    ADMIN = "ADMIN",
    ANNOUNCEMENT = "ANNOUNCEMENT"
}
export declare enum NotificationValidityMode {
    PERMANENT = "PERMANENT",
    TIMED = "TIMED",
    UNTIL_RESOLVED = "UNTIL_RESOLVED"
}
export declare enum NotificationResponseAction {
    ACKNOWLEDGE = "ACKNOWLEDGE",
    INTERESTED = "INTERESTED",
    DECLINE = "DECLINE",
    VIEW = "VIEW"
}
export declare enum ModerationAction {
    DISABLED = "DISABLED",
    WARNED = "WARNED"
}
export declare enum UrgencyLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare const MODULE_NAMES: readonly ["auth", "users", "notifications", "chat", "smoke-break", "chores", "food-locker", "building-announcements", "admin"];
export type ModuleName = (typeof MODULE_NAMES)[number];
//# sourceMappingURL=index.d.ts.map