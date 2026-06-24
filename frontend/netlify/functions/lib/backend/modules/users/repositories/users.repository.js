import prisma from '../../../core/database/prisma.js';
import { userInclude } from '../dto/user.dto.js';
export class UsersRepository {
    findById(id) {
        return prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: userInclude,
        });
    }
    findMany(floorId) {
        return prisma.user.findMany({
            where: { deletedAt: null, ...(floorId ? { floorId } : {}) },
            include: userInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateProfile(userId, data) {
        const { floorId, ...profileFields } = data;
        await prisma.$transaction(async (tx) => {
            if (floorId !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: { floorId },
                });
            }
            const profileData = Object.fromEntries(Object.entries(profileFields).filter(([, value]) => value !== undefined));
            if (profileData.companyName !== undefined) {
                profileData.companyName = profileData.companyName.trim() || null;
            }
            if (Object.keys(profileData).length > 0) {
                const existing = await tx.userProfile.findUnique({ where: { userId } });
                const name = profileData.name ?? existing?.name ?? 'User';
                await tx.userProfile.upsert({
                    where: { userId },
                    create: {
                        userId,
                        name,
                        ...profileData,
                    },
                    update: profileData,
                });
            }
        });
    }
    updatePhoto(userId, photoUrl) {
        return prisma.userProfile.update({
            where: { userId },
            data: { photoUrl },
        });
    }
}
