import prisma from '../../../core/database/prisma.js';
import { userInclude } from '../../users/dto/user.dto.js';

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: userInclude,
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    role: string;
    name: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role as 'RESIDENT' | 'BUSINESS_USER' | 'BUILDING_ADMIN',
        profile: {
          create: {
            name: data.name,
          },
        },
      },
      include: { profile: true, floor: { include: { building: true } } },
    });
  }

  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }
}

export type { AuthRepository as AuthRepositoryType };
