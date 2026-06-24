import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import { eventBus } from '../../../core/events/event-bus.js';
function formatLocation(floorLabel, locationType) {
    switch (locationType) {
        case 'TERRACE':
            return `${floorLabel} Terasa`;
        case 'KITCHEN':
            return `${floorLabel} Kuhinja`;
        case 'COFFEE_SHOP':
            return 'Kavana IT Parka';
        default:
            return floorLabel;
    }
}
export class SmokeBreakRepository {
    create(data) {
        return prisma.smokeBreakInvitation.create({
            data,
            include: invitationInclude,
        });
    }
    findActive(viewFloorId) {
        const now = new Date();
        const floorScoped = viewFloorId
            ? {
                floorId: viewFloorId,
                locationType: { in: ['TERRACE', 'KITCHEN'] },
            }
            : null;
        return prisma.smokeBreakInvitation.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: now },
                OR: [
                    { locationType: 'COFFEE_SHOP' },
                    ...(floorScoped ? [floorScoped] : []),
                ],
            },
            include: invitationInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    findById(id) {
        return prisma.smokeBreakInvitation.findUnique({
            where: { id },
            include: invitationInclude,
        });
    }
    addParticipant(invitationId, userId) {
        return prisma.smokeBreakParticipant.create({
            data: { invitationId, userId },
        });
    }
    cancel(id, creatorId) {
        return prisma.smokeBreakInvitation.updateMany({
            where: { id, creatorId, status: 'ACTIVE' },
            data: { status: 'CANCELLED' },
        });
    }
}
const invitationInclude = {
    creator: { include: userInclude },
    floor: true,
    participants: { include: { user: { include: userInclude } } },
};
function toDto(inv) {
    return {
        id: inv.id,
        creatorId: inv.creatorId,
        floorId: inv.floorId,
        breakType: inv.breakType,
        locationType: inv.locationType,
        location: inv.location,
        durationMinutes: inv.durationMinutes,
        expiresAt: inv.expiresAt.toISOString(),
        status: inv.status,
        creator: inv.creator ? toUserProfileDto(inv.creator) : undefined,
        participants: inv.participants.map((p) => ({
            userId: p.userId,
            joinedAt: p.joinedAt.toISOString(),
            user: p.user ? toUserProfileDto(p.user) : undefined,
        })),
        createdAt: inv.createdAt.toISOString(),
    };
}
export class SmokeBreakService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(creatorId, data) {
        const floor = await prisma.floor.findUnique({ where: { id: data.floorId } });
        if (!floor)
            throw new Error('Floor not found');
        const location = formatLocation(floor.label, data.locationType);
        const expiresAt = new Date(Date.now() + data.durationMinutes * 60 * 1000);
        const inv = await this.repo.create({
            creatorId,
            floorId: data.floorId,
            breakType: data.breakType,
            locationType: data.locationType,
            location,
            durationMinutes: data.durationMinutes,
            expiresAt,
        });
        const dto = toDto(inv);
        eventBus.emit('smoke-break.invitation.created', { invitation: dto, floorId: data.floorId });
        return dto;
    }
    async listActive(viewFloorId) {
        const items = await this.repo.findActive(viewFloorId);
        return items.map(toDto);
    }
    async join(invitationId, userId) {
        const inv = await this.repo.findById(invitationId);
        if (!inv || inv.status !== 'ACTIVE' || inv.expiresAt < new Date()) {
            throw new Error('Invitation not available');
        }
        if (inv.participants.some((p) => p.userId === userId)) {
            return toDto(inv);
        }
        await this.repo.addParticipant(invitationId, userId);
        eventBus.emit('smoke-break.participant.joined', {
            invitationId,
            userId,
            creatorId: inv.creatorId,
        });
        const updated = await this.repo.findById(invitationId);
        return toDto(updated);
    }
    async cancel(id, creatorId) {
        await this.repo.cancel(id, creatorId);
    }
}
export { toDto as toSmokeBreakDto, formatLocation };
