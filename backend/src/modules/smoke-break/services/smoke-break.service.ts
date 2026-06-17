import type { BreakLocationType } from '@prisma/client';
import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import type { SmokeBreakInvitationDto } from '@building-app/shared';
import { eventBus } from '../../../core/events/event-bus.js';

function formatLocation(floorLabel: string, locationType: BreakLocationType): string {
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
  create(data: {
    creatorId: string;
    floorId: string;
    breakType: 'SMOKE' | 'COFFEE';
    locationType: BreakLocationType;
    location: string;
    durationMinutes: number;
    expiresAt: Date;
  }) {
    return prisma.smokeBreakInvitation.create({
      data,
      include: invitationInclude,
    });
  }

  findActive(viewFloorId?: string) {
    const now = new Date();
    const floorScoped = viewFloorId
      ? {
          floorId: viewFloorId,
          locationType: { in: ['TERRACE', 'KITCHEN'] as BreakLocationType[] },
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

  findById(id: string) {
    return prisma.smokeBreakInvitation.findUnique({
      where: { id },
      include: invitationInclude,
    });
  }

  addParticipant(invitationId: string, userId: string) {
    return prisma.smokeBreakParticipant.create({
      data: { invitationId, userId },
    });
  }

  cancel(id: string, creatorId: string) {
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
} as const;

function toDto(inv: NonNullable<Awaited<ReturnType<SmokeBreakRepository['findById']>>>): SmokeBreakInvitationDto {
  return {
    id: inv.id,
    creatorId: inv.creatorId,
    floorId: inv.floorId,
    breakType: inv.breakType as SmokeBreakInvitationDto['breakType'],
    locationType: inv.locationType as SmokeBreakInvitationDto['locationType'],
    location: inv.location,
    durationMinutes: inv.durationMinutes,
    expiresAt: inv.expiresAt.toISOString(),
    status: inv.status as SmokeBreakInvitationDto['status'],
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
  constructor(private repo: SmokeBreakRepository) {}

  async create(
    creatorId: string,
    data: {
      floorId: string;
      breakType: 'SMOKE' | 'COFFEE';
      locationType: BreakLocationType;
      durationMinutes: number;
    },
  ) {
    const floor = await prisma.floor.findUnique({ where: { id: data.floorId } });
    if (!floor) throw new Error('Floor not found');

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

  async listActive(viewFloorId?: string) {
    const items = await this.repo.findActive(viewFloorId);
    return items.map(toDto);
  }

  async join(invitationId: string, userId: string) {
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
    return toDto(updated!);
  }

  async cancel(id: string, creatorId: string) {
    await this.repo.cancel(id, creatorId);
  }
}

export { toDto as toSmokeBreakDto, formatLocation };
