import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import type { BusinessHelpRequestDto } from '@building-app/shared';
import { eventBus } from '../../../core/events/event-bus.js';

export class BusinessHelpRepository {
  createRequest(data: {
    requesterId: string;
    floorId?: string;
    category: string;
    title: string;
    description: string;
  }) {
    return prisma.businessHelpRequest.create({
      data,
      include: { requester: { include: userInclude } },
    });
  }

  createOffer(data: {
    offererId: string;
    requestId?: string;
    category: string;
    title: string;
    description: string;
  }) {
    return prisma.businessHelpOffer.create({
      data,
      include: { offerer: { include: userInclude } },
    });
  }

  findRequests(floorId?: string) {
    return prisma.businessHelpRequest.findMany({
      where: { deletedAt: null, ...(floorId ? { floorId } : {}) },
      include: { requester: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOffers() {
    return prisma.businessHelpOffer.findMany({
      where: { requestId: null },
      include: { offerer: { include: userInclude } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createMatch(requestId: string, offerId: string) {
    return prisma.$transaction(async (tx) => {
      const match = await tx.businessHelpMatch.create({
        data: { requestId, offerId },
        include: {
          request: { include: { requester: { include: userInclude } } },
          offer: { include: { offerer: { include: userInclude } } },
        },
      });
      await tx.businessHelpRequest.update({
        where: { id: requestId },
        data: { status: 'MATCHED' },
      });
      await tx.businessHelpOffer.update({
        where: { id: offerId },
        data: { requestId },
      });
      return match;
    });
  }

  scheduleMeeting(matchId: string, scheduledAt: Date, location: string, notes?: string) {
    return prisma.businessHelpMeeting.create({
      data: { matchId, scheduledAt, location, notes },
    });
  }

  updateRequestStatus(id: string, status: string) {
    return prisma.businessHelpRequest.update({
      where: { id },
      data: { status: status as 'OPEN' | 'MATCHED' | 'COMPLETED' | 'CLOSED' },
      include: { requester: { include: userInclude } },
    });
  }
}

function toRequestDto(r: Awaited<ReturnType<BusinessHelpRepository['createRequest']>>): BusinessHelpRequestDto {
  return {
    id: r.id,
    requesterId: r.requesterId,
    floorId: r.floorId,
    category: r.category,
    title: r.title,
    description: r.description,
    status: r.status as BusinessHelpRequestDto['status'],
    requester: r.requester ? toUserProfileDto(r.requester) : undefined,
    createdAt: r.createdAt.toISOString(),
  };
}

export class BusinessHelpService {
  constructor(private repo: BusinessHelpRepository) {}

  createRequest(requesterId: string, data: {
    floorId?: string;
    category: string;
    title: string;
    description: string;
  }) {
    return this.repo.createRequest({ requesterId, ...data }).then(toRequestDto);
  }

  createOffer(offererId: string, data: {
    requestId?: string;
    category: string;
    title: string;
    description: string;
  }) {
    return this.repo.createOffer({ offererId, ...data });
  }

  listRequests(floorId?: string) {
    return this.repo.findRequests(floorId).then((items) => items.map(toRequestDto));
  }

  listOffers() {
    return this.repo.findOffers();
  }

  async match(requestId: string, offerId: string) {
    const match = await this.repo.createMatch(requestId, offerId);
    eventBus.emit('business-help.matched', {
      requestId,
      offerId,
      requesterId: match.request.requesterId,
      offererId: match.offer.offererId,
    });
    return match;
  }

  scheduleMeeting(matchId: string, scheduledAt: string, location: string, notes?: string) {
    return this.repo.scheduleMeeting(matchId, new Date(scheduledAt), location, notes);
  }

  updateStatus(id: string, status: string) {
    return this.repo.updateRequestStatus(id, status).then(toRequestDto);
  }
}
