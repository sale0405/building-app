import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import { eventBus } from '../../../core/events/event-bus.js';

export class AdminRepository {
  listUsers(floorId?: string) {
    return prisma.user.findMany({
      where: { deletedAt: null, ...(floorId ? { floorId } : {}) },
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  disableUser(userId: string, adminId: string, reason: string) {
    return prisma.$transaction([
      prisma.userModeration.create({
        data: { userId, action: 'DISABLED', reason, adminId },
      }),
      prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'DISABLE_USER',
          targetType: 'user',
          targetId: userId,
          metadata: { reason },
        },
      }),
    ]);
  }

  removeListing(listingId: string, adminId: string) {
    return prisma.$transaction([
      prisma.foodListing.update({
        where: { id: listingId },
        data: { deletedAt: new Date(), status: 'EXPIRED' },
      }),
      prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'REMOVE_LISTING',
          targetType: 'food-listing',
          targetId: listingId,
          metadata: {},
        },
      }),
    ]);
  }

  createReport(data: { reporterId: string; targetType: string; targetId: string; reason: string }) {
    return prisma.adminReport.create({ data });
  }

  listReports() {
    return prisma.adminReport.findMany({ orderBy: { createdAt: 'desc' } });
  }

  getAnalytics(floorId?: string) {
    return Promise.all([
      prisma.user.count({ where: { deletedAt: null, ...(floorId ? { floorId } : {}) } }),
      prisma.foodListing.count({ where: { status: 'AVAILABLE', deletedAt: null, ...(floorId ? { floorId } : {}) } }),
      prisma.choreRequest.count({ where: { status: 'OPEN', deletedAt: null, ...(floorId ? { floorId } : {}) } }),
      prisma.message.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      prisma.floor.findMany({ include: { building: true }, orderBy: { number: 'asc' } }),
    ]);
  }

  countUsersByFloor() {
    return prisma.user.groupBy({
      by: ['floorId'],
      where: { deletedAt: null },
      _count: { id: true },
    });
  }
}

export class AdminService {
  constructor(private repo: AdminRepository) {}

  listUsers(floorId?: string) {
    return this.repo.listUsers(floorId).then((users) => users.map(toUserProfileDto));
  }

  async disableUser(userId: string, adminId: string, reason: string) {
    await this.repo.disableUser(userId, adminId, reason);
  }

  async removeListing(listingId: string, adminId: string) {
    const listing = await prisma.foodListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new Error('Listing not found');
    await this.repo.removeListing(listingId, adminId);
    eventBus.emit('admin.listing.removed', {
      listingId,
      sellerId: listing.sellerId,
      adminId,
    });
  }

  createReport(data: { reporterId: string; targetType: string; targetId: string; reason: string }) {
    return this.repo.createReport(data);
  }

  listReports() {
    return this.repo.listReports();
  }

  async getAnalytics(floorId?: string) {
    const [totalUsers, activeListings, openChores, messagesLast24h, floors] =
      await this.repo.getAnalytics(floorId);
    const usersByFloorRaw = await this.repo.countUsersByFloor();
    const floorMap = new Map(floors.map((f) => [f.id, f.label]));

    return {
      totalUsers,
      usersByFloor: usersByFloorRaw.map((u) => ({
        floorId: u.floorId,
        floorLabel: floorMap.get(u.floorId) ?? 'Unknown',
        count: u._count.id,
      })),
      activeListings,
      openChores,
      messagesLast24h,
    };
  }
}
