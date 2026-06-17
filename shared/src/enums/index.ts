export enum UserRole {
  RESIDENT = 'RESIDENT',
  BUSINESS_USER = 'BUSINESS_USER',
  BUILDING_ADMIN = 'BUILDING_ADMIN',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE',
}

export enum SmokeBreakStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BreakType {
  SMOKE = 'SMOKE',
  COFFEE = 'COFFEE',
}

export enum BreakLocationType {
  TERRACE = 'TERRACE',
  KITCHEN = 'KITCHEN',
  COFFEE_SHOP = 'COFFEE_SHOP',
}

export enum ChoreStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CoopAudienceType {
  OPEN = 'OPEN',
  MY_COMPANY = 'MY_COMPANY',
  OTHER_COMPANY = 'OTHER_COMPANY',
  SPECIFIC_USER = 'SPECIFIC_USER',
}

export enum FoodListingStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
}

export enum BusinessHelpStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  SYSTEM = 'SYSTEM',
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  FILE = 'FILE',
}

export enum NotificationType {
  SMOKE_BREAK = 'SMOKE_BREAK',
  CHORE = 'CHORE',
  FOOD_LOCKER = 'FOOD_LOCKER',
  BUSINESS_HELP = 'BUSINESS_HELP',
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum NotificationValidityMode {
  PERMANENT = 'PERMANENT',
  TIMED = 'TIMED',
  UNTIL_RESOLVED = 'UNTIL_RESOLVED',
}

export enum NotificationResponseAction {
  ACKNOWLEDGE = 'ACKNOWLEDGE',
  INTERESTED = 'INTERESTED',
  DECLINE = 'DECLINE',
  VIEW = 'VIEW',
}

export enum ModerationAction {
  DISABLED = 'DISABLED',
  WARNED = 'WARNED',
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const MODULE_NAMES = [
  'auth',
  'users',
  'notifications',
  'chat',
  'smoke-break',
  'chores',
  'food-locker',
  'building-announcements',
  'admin',
] as const;

export type ModuleName = (typeof MODULE_NAMES)[number];
