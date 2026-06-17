import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import type { BuildingAnnouncementDto } from '@building-app/shared';
import { eventBus } from '../../../core/events/event-bus.js';

const include = {
  createdBy: { include: userInclude },
} as const;

export class BuildingAnnouncementsRepository {
  async getDefaultBuildingId() {
    const building = await prisma.building.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!building) throw new Error('Zgrada nije pronađena.');
    return building.id;
  }

  findActive(buildingId: string) {
    const now = new Date();
    return prisma.buildingAnnouncement.findMany({
      where: {
        buildingId,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    buildingId: string;
    title: string;
    body: string;
    createdByUserId: string;
    expiresAt?: Date | null;
  }) {
    return prisma.buildingAnnouncement.create({
      data,
      include,
    });
  }

  softDelete(id: string) {
    return prisma.buildingAnnouncement.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  findAllUserIds() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
  }
}

function toDto(
  row: NonNullable<Awaited<ReturnType<BuildingAnnouncementsRepository['create']>>>,
): BuildingAnnouncementDto {
  return {
    id: row.id,
    buildingId: row.buildingId,
    title: row.title,
    body: row.body,
    createdByUserId: row.createdByUserId,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    author: row.createdBy ? toUserProfileDto(row.createdBy) : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export class BuildingAnnouncementsService {
  constructor(private repo: BuildingAnnouncementsRepository) {}

  async list() {
    const buildingId = await this.repo.getDefaultBuildingId();
    const rows = await this.repo.findActive(buildingId);
    return rows.map(toDto);
  }

  async create(
    adminId: string,
    data: { title: string; body: string; expiresAt?: string },
  ) {
    const buildingId = await this.repo.getDefaultBuildingId();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    const row = await this.repo.create({
      buildingId,
      title: data.title,
      body: data.body,
      createdByUserId: adminId,
      expiresAt,
    });
    const announcement = toDto(row);
    const users = await this.repo.findAllUserIds();
    eventBus.emit('building-announcement.created', {
      announcement,
      userIds: users.map((u) => u.id),
    });
    return announcement;
  }

  async remove(id: string) {
    const result = await this.repo.softDelete(id);
    if (result.count === 0) throw new Error('Obavijest nije pronađena.');
  }
}
