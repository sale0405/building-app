import prisma from '../../../core/database/prisma.js';
import { userInclude } from '../dto/user.dto.js';

interface UpdateProfileInput {
  name?: string;
  companyName?: string;
  officeNumber?: string;
  bio?: string;
  availabilityStatus?: string;
  floorId?: string;
}

export class UsersRepository {
  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userInclude,
    });
  }

  findMany(floorId?: string) {
    return prisma.user.findMany({
      where: { deletedAt: null, ...(floorId ? { floorId } : {}) },
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const { floorId, ...profileFields } = data;

    await prisma.$transaction(async (tx) => {
      if (floorId !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { floorId },
        });
      }

      const profileData = Object.fromEntries(
        Object.entries(profileFields).filter(([, value]) => value !== undefined),
      );

      if (profileData.companyName !== undefined) {
        profileData.companyName = (profileData.companyName as string).trim() || null;
      }

      if (Object.keys(profileData).length > 0) {
        const existing = await tx.userProfile.findUnique({ where: { userId } });
        const name = (profileData.name as string | undefined) ?? existing?.name ?? 'User';

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

  updatePhoto(userId: string, photoUrl: string) {
    return prisma.userProfile.update({
      where: { userId },
      data: { photoUrl },
    });
  }
}
