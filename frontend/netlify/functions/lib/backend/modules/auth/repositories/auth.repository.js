import prisma from '../../../core/database/prisma.js';
import { userInclude } from '../../users/dto/user.dto.js';
export class AuthRepository {
    findByEmail(email) {
        return prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: userInclude,
        });
    }
    async createUser(data) {
        return prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role,
                profile: {
                    create: {
                        name: data.name,
                    },
                },
            },
            include: { profile: true, floor: { include: { building: true } } },
        });
    }
    createRefreshToken(userId, tokenHash, expiresAt) {
        return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
    }
    findRefreshToken(tokenHash) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
    }
    revokeRefreshToken(tokenHash) {
        return prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revokedAt: new Date() },
        });
    }
    createPasswordResetToken(userId, tokenHash, expiresAt) {
        return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
    }
    findPasswordResetToken(tokenHash) {
        return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    }
}
