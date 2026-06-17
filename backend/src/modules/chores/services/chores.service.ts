import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import type { ChoreRequestDto, CoopAudienceType } from '@building-app/shared';
import { eventBus } from '../../../core/events/event-bus.js';
import { canViewCoop, canVolunteerForCoop, normalizeCompany } from '../utils/coop-audience.js';

const choreInclude = {
  requester: { include: userInclude },
  volunteer: { include: userInclude },
  targetUser: { include: userInclude },
} as const;

export class ChoresRepository {
  create(data: {
    requesterId: string;
    floorId: string;
    title: string;
    description: string;
    helpType: string;
    estimatedDuration: number;
    preferredTime?: Date;
    urgency: string;
    audienceType: CoopAudienceType;
    targetCompanyName?: string | null;
    targetUserId?: string | null;
  }) {
    return prisma.choreRequest.create({
      data: {
        ...data,
        urgency: data.urgency as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        audienceType: data.audienceType as 'OPEN' | 'MY_COMPANY' | 'OTHER_COMPANY' | 'SPECIFIC_USER',
        targetCompanyName: data.targetCompanyName ?? null,
        targetUserId: data.targetUserId ?? null,
      },
      include: choreInclude,
    });
  }

  findMany(floorId?: string, status?: string) {
    return prisma.choreRequest.findMany({
      where: {
        deletedAt: null,
        ...(floorId ? { floorId } : {}),
        ...(status ? { status: status as 'OPEN' } : {}),
      },
      include: choreInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return prisma.choreRequest.findFirst({
      where: { id, deletedAt: null },
      include: choreInclude,
    });
  }

  findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userInclude,
    });
  }

  listCompanyNames() {
    return prisma.userProfile.findMany({
      where: {
        companyName: { not: null },
        user: { deletedAt: null },
      },
      select: { companyName: true },
      distinct: ['companyName'],
      orderBy: { companyName: 'asc' },
    });
  }

  findAudienceUserIds(
    audienceType: CoopAudienceType,
    floorId: string,
    requesterId: string,
    targetCompanyName: string | null,
    targetUserId: string | null,
    requesterCompanyName: string | null,
  ) {
    switch (audienceType) {
      case 'OPEN':
        return prisma.user.findMany({
          where: { deletedAt: null, floorId, id: { not: requesterId } },
          select: { id: true },
        });
      case 'MY_COMPANY':
        if (!requesterCompanyName) return Promise.resolve([]);
        return prisma.user.findMany({
          where: {
            deletedAt: null,
            id: { not: requesterId },
            profile: { companyName: requesterCompanyName },
          },
          select: { id: true },
        });
      case 'OTHER_COMPANY':
        if (!targetCompanyName) return Promise.resolve([]);
        return prisma.user.findMany({
          where: {
            deletedAt: null,
            id: { not: requesterId },
            profile: { companyName: targetCompanyName },
          },
          select: { id: true },
        });
      case 'SPECIFIC_USER':
        return targetUserId && targetUserId !== requesterId
          ? Promise.resolve([{ id: targetUserId }])
          : Promise.resolve([]);
      default:
        return Promise.resolve([]);
    }
  }

  volunteer(id: string, volunteerId: string) {
    return prisma.choreRequest.update({
      where: { id, status: 'OPEN' },
      data: { volunteerId, status: 'ACCEPTED' },
      include: choreInclude,
    });
  }

  updateStatus(id: string, status: string, changedById: string) {
    return prisma.$transaction(async (tx) => {
      const chore = await tx.choreRequest.update({
        where: { id },
        data: { status: status as 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' },
        include: choreInclude,
      });
      await tx.choreStatusHistory.create({
        data: {
          choreId: id,
          status: status as 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
          changedById,
        },
      });
      return chore;
    });
  }
}

function toDto(c: NonNullable<Awaited<ReturnType<ChoresRepository['findById']>>>): ChoreRequestDto {
  return {
    id: c.id,
    requesterId: c.requesterId,
    floorId: c.floorId,
    title: c.title,
    description: c.description,
    helpType: c.helpType,
    estimatedDuration: c.estimatedDuration,
    preferredTime: c.preferredTime?.toISOString() ?? null,
    urgency: c.urgency as ChoreRequestDto['urgency'],
    audienceType: c.audienceType as ChoreRequestDto['audienceType'],
    targetCompanyName: c.targetCompanyName,
    targetUserId: c.targetUserId,
    status: c.status as ChoreRequestDto['status'],
    volunteerId: c.volunteerId,
    requester: c.requester ? toUserProfileDto(c.requester) : undefined,
    volunteer: c.volunteer ? toUserProfileDto(c.volunteer) : undefined,
    targetUser: c.targetUser ? toUserProfileDto(c.targetUser) : undefined,
    createdAt: c.createdAt.toISOString(),
  };
}

export class ChoresService {
  constructor(private repo: ChoresRepository) {}

  private viewerContext(user: NonNullable<Awaited<ReturnType<ChoresRepository['findUserById']>>>) {
    return {
      userId: user.id,
      companyName: user.profile?.companyName ?? null,
    };
  }

  private choreContext(chore: NonNullable<Awaited<ReturnType<ChoresRepository['findById']>>>) {
    return {
      requesterId: chore.requesterId,
      volunteerId: chore.volunteerId,
      audienceType: chore.audienceType as CoopAudienceType,
      targetCompanyName: chore.targetCompanyName,
      targetUserId: chore.targetUserId,
      requesterCompanyName: chore.requester?.profile?.companyName ?? null,
    };
  }

  private async validateCreate(
    requester: NonNullable<Awaited<ReturnType<ChoresRepository['findUserById']>>>,
    data: {
      audienceType: CoopAudienceType;
      targetCompanyName?: string;
      targetUserId?: string;
    },
  ) {
    const requesterCompany = normalizeCompany(requester.profile?.companyName);

    switch (data.audienceType) {
      case 'MY_COMPANY':
        if (!requesterCompany) {
          throw new Error('Unesite naziv tvrtke na profilu za CO-OP unutar tvrtke.');
        }
        break;
      case 'OTHER_COMPANY': {
        const targetCompany = normalizeCompany(data.targetCompanyName);
        if (!targetCompany) throw new Error('Odaberite tvrtku.');
        if (requesterCompany && targetCompany === requesterCompany) {
          throw new Error('Odaberite drugu tvrtku, ne svoju.');
        }
        break;
      }
      case 'SPECIFIC_USER': {
        if (!data.targetUserId) throw new Error('Odaberite korisnika.');
        if (data.targetUserId === requester.id) throw new Error('Ne možete odabrati sebe.');
        const targetUser = await this.repo.findUserById(data.targetUserId);
        if (!targetUser) throw new Error('Korisnik nije pronađen.');
        break;
      }
    }
  }

  async create(
    requesterId: string,
    data: {
      title: string;
      description: string;
      helpType: string;
      estimatedDuration: number;
      preferredTime?: string;
      urgency: string;
      floorId?: string;
      audienceType: CoopAudienceType;
      targetCompanyName?: string;
      targetUserId?: string;
    },
    userFloorId: string,
  ) {
    const requester = await this.repo.findUserById(requesterId);
    if (!requester) throw new Error('Korisnik nije pronađen.');

    await this.validateCreate(requester, data);

    const requesterCompany = normalizeCompany(requester.profile?.companyName);
    const targetCompanyName =
      data.audienceType === 'OTHER_COMPANY' ? normalizeCompany(data.targetCompanyName) : null;
    const targetUserId = data.audienceType === 'SPECIFIC_USER' ? data.targetUserId ?? null : null;

    const chore = await this.repo.create({
      requesterId,
      floorId: data.floorId ?? userFloorId,
      title: data.title,
      description: data.description,
      helpType: data.helpType,
      estimatedDuration: data.estimatedDuration,
      preferredTime: data.preferredTime ? new Date(data.preferredTime) : undefined,
      urgency: data.urgency,
      audienceType: data.audienceType,
      targetCompanyName,
      targetUserId,
    });

    const dto = toDto(chore);
    const audienceUsers = await this.repo.findAudienceUserIds(
      data.audienceType,
      dto.floorId,
      requesterId,
      targetCompanyName,
      targetUserId,
      requesterCompany,
    );

    eventBus.emit('chore.request.created', {
      chore: dto,
      floorId: dto.floorId,
      notifyUserIds: audienceUsers.map((user) => user.id),
    });

    return dto;
  }

  async list(viewerId: string, floorId?: string, status?: string) {
    const viewer = await this.repo.findUserById(viewerId);
    if (!viewer) throw new Error('Korisnik nije pronađen.');

    const items = await this.repo.findMany(floorId, status);
    const viewerCtx = this.viewerContext(viewer);

    return items
      .filter((item) => canViewCoop(this.choreContext(item), viewerCtx))
      .map(toDto);
  }

  listCompanies() {
    return this.repo.listCompanyNames().then((rows) =>
      rows
        .map((row) => normalizeCompany(row.companyName))
        .filter((name): name is string => Boolean(name)),
    );
  }

  async volunteer(id: string, volunteerId: string) {
    const [chore, volunteer] = await Promise.all([
      this.repo.findById(id),
      this.repo.findUserById(volunteerId),
    ]);

    if (!chore) throw new Error('CO-OP zahtjev nije pronađen.');
    if (!volunteer) throw new Error('Korisnik nije pronađen.');
    if (chore.status !== 'OPEN') throw new Error('CO-OP više nije otvoren.');

    if (!canVolunteerForCoop(this.choreContext(chore), this.viewerContext(volunteer))) {
      throw new Error('Nemate pristup ovom CO-OP zahtjevu.');
    }

    const updated = await this.repo.volunteer(id, volunteerId);
    const dto = toDto(updated);
    eventBus.emit('chore.status.changed', {
      choreId: id,
      status: 'ACCEPTED',
      requesterId: chore.requesterId,
      volunteerId,
    });
    return dto;
  }

  async updateStatus(id: string, status: string, changedById: string) {
    const chore = await this.repo.updateStatus(id, status, changedById);
    const dto = toDto(chore);
    eventBus.emit('chore.status.changed', {
      choreId: id,
      status,
      requesterId: chore.requesterId,
      volunteerId: chore.volunteerId,
    });
    return dto;
  }

  async getById(id: string, viewerId: string) {
    const [chore, viewer] = await Promise.all([
      this.repo.findById(id),
      this.repo.findUserById(viewerId),
    ]);

    if (!chore || !viewer) throw new Error('CO-OP zahtjev nije pronađen.');
    if (!canViewCoop(this.choreContext(chore), this.viewerContext(viewer))) {
      throw new Error('Nemate pristup ovom CO-OP zahtjevu.');
    }

    return toDto(chore);
  }
}
