import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/modules.js';
import prisma from '../../../core/database/prisma.js';
export class AuthService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async register(data) {
        const existing = await this.repo.findByEmail(data.email);
        if (existing)
            throw new Error('E-pošta je već registrirana');
        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await this.repo.createUser({
            email: data.email,
            passwordHash,
            role: data.role,
            name: data.name,
        });
        const tokens = await this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            floorId: user.floorId,
        });
        return { user, tokens };
    }
    async login(email, password) {
        const user = await this.repo.findByEmail(email);
        if (!user)
            throw new Error('Neispravni podaci za prijavu');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new Error('Neispravni podaci za prijavu');
        const tokens = await this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            floorId: user.floorId,
        });
        return { user, tokens };
    }
    async logout(refreshToken) {
        const hash = this.hashToken(refreshToken);
        await this.repo.revokeRefreshToken(hash);
    }
    async refresh(refreshToken) {
        const hash = this.hashToken(refreshToken);
        const stored = await this.repo.findRefreshToken(hash);
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new Error('Neispravan token za osvježavanje');
        }
        await this.repo.revokeRefreshToken(hash);
        return this.generateTokens({
            id: stored.user.id,
            email: stored.user.email,
            role: stored.user.role,
            floorId: stored.user.floorId,
        });
    }
    async forgotPassword(email) {
        const user = await this.repo.findByEmail(email);
        if (!user)
            return null;
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + 3600000);
        await this.repo.createPasswordResetToken(user.id, tokenHash, expiresAt);
        return token;
    }
    async resetPassword(token, password) {
        const hash = this.hashToken(token);
        const resetToken = await this.repo.findPasswordResetToken(hash);
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            throw new Error('Neispravan ili istekao token za reset lozinke');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.$transaction([
            prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async generateTokens(user) {
        const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role, floorId: user.floorId }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.repo.createRefreshToken(user.id, tokenHash, expiresAt);
        return { accessToken, refreshToken };
    }
}
