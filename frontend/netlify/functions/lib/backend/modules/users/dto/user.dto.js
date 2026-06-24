export function toUserProfileDto(user) {
    const officeNumber = user.profile?.officeNumber ?? null;
    const hasFloor = Boolean(user.floor);
    return {
        id: user.profile?.id ?? user.id,
        userId: user.id,
        name: user.profile?.name ?? '',
        companyName: user.profile?.companyName ?? null,
        officeNumber,
        bio: user.profile?.bio ?? null,
        photoUrl: user.profile?.photoUrl ?? null,
        availabilityStatus: user.profile?.availabilityStatus ?? 'AVAILABLE',
        floor: user.floor
            ? {
                id: user.floor.id,
                number: user.floor.number,
                label: user.floor.label,
                buildingId: user.floor.buildingId,
            }
            : null,
        profileComplete: hasFloor && Boolean(officeNumber),
        role: user.role,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
export const userInclude = {
    profile: true,
    floor: { include: { building: true } },
};
