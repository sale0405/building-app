export var UserRole;
(function (UserRole) {
    UserRole["RESIDENT"] = "RESIDENT";
    UserRole["BUSINESS_USER"] = "BUSINESS_USER";
    UserRole["BUILDING_ADMIN"] = "BUILDING_ADMIN";
})(UserRole || (UserRole = {}));
export var AvailabilityStatus;
(function (AvailabilityStatus) {
    AvailabilityStatus["AVAILABLE"] = "AVAILABLE";
    AvailabilityStatus["BUSY"] = "BUSY";
    AvailabilityStatus["AWAY"] = "AWAY";
    AvailabilityStatus["OFFLINE"] = "OFFLINE";
})(AvailabilityStatus || (AvailabilityStatus = {}));
export var SmokeBreakStatus;
(function (SmokeBreakStatus) {
    SmokeBreakStatus["ACTIVE"] = "ACTIVE";
    SmokeBreakStatus["CANCELLED"] = "CANCELLED";
    SmokeBreakStatus["EXPIRED"] = "EXPIRED";
})(SmokeBreakStatus || (SmokeBreakStatus = {}));
export var BreakType;
(function (BreakType) {
    BreakType["SMOKE"] = "SMOKE";
    BreakType["COFFEE"] = "COFFEE";
})(BreakType || (BreakType = {}));
export var BreakLocationType;
(function (BreakLocationType) {
    BreakLocationType["TERRACE"] = "TERRACE";
    BreakLocationType["KITCHEN"] = "KITCHEN";
    BreakLocationType["COFFEE_SHOP"] = "COFFEE_SHOP";
})(BreakLocationType || (BreakLocationType = {}));
export var ChoreStatus;
(function (ChoreStatus) {
    ChoreStatus["OPEN"] = "OPEN";
    ChoreStatus["ACCEPTED"] = "ACCEPTED";
    ChoreStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ChoreStatus["COMPLETED"] = "COMPLETED";
    ChoreStatus["CANCELLED"] = "CANCELLED";
})(ChoreStatus || (ChoreStatus = {}));
export var CoopAudienceType;
(function (CoopAudienceType) {
    CoopAudienceType["OPEN"] = "OPEN";
    CoopAudienceType["MY_COMPANY"] = "MY_COMPANY";
    CoopAudienceType["OTHER_COMPANY"] = "OTHER_COMPANY";
    CoopAudienceType["SPECIFIC_USER"] = "SPECIFIC_USER";
})(CoopAudienceType || (CoopAudienceType = {}));
export var FoodListingStatus;
(function (FoodListingStatus) {
    FoodListingStatus["AVAILABLE"] = "AVAILABLE";
    FoodListingStatus["RESERVED"] = "RESERVED";
    FoodListingStatus["SOLD"] = "SOLD";
    FoodListingStatus["EXPIRED"] = "EXPIRED";
})(FoodListingStatus || (FoodListingStatus = {}));
export var BusinessHelpStatus;
(function (BusinessHelpStatus) {
    BusinessHelpStatus["OPEN"] = "OPEN";
    BusinessHelpStatus["MATCHED"] = "MATCHED";
    BusinessHelpStatus["COMPLETED"] = "COMPLETED";
    BusinessHelpStatus["CLOSED"] = "CLOSED";
})(BusinessHelpStatus || (BusinessHelpStatus = {}));
export var ConversationType;
(function (ConversationType) {
    ConversationType["DIRECT"] = "DIRECT";
    ConversationType["GROUP"] = "GROUP";
    ConversationType["SYSTEM"] = "SYSTEM";
})(ConversationType || (ConversationType = {}));
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["SYSTEM"] = "SYSTEM";
    MessageType["FILE"] = "FILE";
})(MessageType || (MessageType = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["SMOKE_BREAK"] = "SMOKE_BREAK";
    NotificationType["CHORE"] = "CHORE";
    NotificationType["FOOD_LOCKER"] = "FOOD_LOCKER";
    NotificationType["BUSINESS_HELP"] = "BUSINESS_HELP";
    NotificationType["CHAT"] = "CHAT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["ADMIN"] = "ADMIN";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(NotificationType || (NotificationType = {}));
export var NotificationValidityMode;
(function (NotificationValidityMode) {
    NotificationValidityMode["PERMANENT"] = "PERMANENT";
    NotificationValidityMode["TIMED"] = "TIMED";
    NotificationValidityMode["UNTIL_RESOLVED"] = "UNTIL_RESOLVED";
})(NotificationValidityMode || (NotificationValidityMode = {}));
export var NotificationResponseAction;
(function (NotificationResponseAction) {
    NotificationResponseAction["ACKNOWLEDGE"] = "ACKNOWLEDGE";
    NotificationResponseAction["INTERESTED"] = "INTERESTED";
    NotificationResponseAction["DECLINE"] = "DECLINE";
    NotificationResponseAction["VIEW"] = "VIEW";
})(NotificationResponseAction || (NotificationResponseAction = {}));
export var ModerationAction;
(function (ModerationAction) {
    ModerationAction["DISABLED"] = "DISABLED";
    ModerationAction["WARNED"] = "WARNED";
})(ModerationAction || (ModerationAction = {}));
export var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["LOW"] = "LOW";
    UrgencyLevel["MEDIUM"] = "MEDIUM";
    UrgencyLevel["HIGH"] = "HIGH";
    UrgencyLevel["URGENT"] = "URGENT";
})(UrgencyLevel || (UrgencyLevel = {}));
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
];
