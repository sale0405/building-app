import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import { eventBus } from '../../../core/events/event-bus.js';
export class BusinessHelpRepository {
    createRequest(data) {
        return prisma.businessHelpRequest.create({
            data,
            include: { requester: { include: userInclude } },
        });
    }
    createOffer(data) {
        return prisma.businessHelpOffer.create({
            data,
            include: { offerer: { include: userInclude } },
        });
    }
    findRequests(floorId) {
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
    createMatch(requestId, offerId) {
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
    scheduleMeeting(matchId, scheduledAt, location, notes) {
        return prisma.businessHelpMeeting.create({
            data: { matchId, scheduledAt, location, notes },
        });
    }
    updateRequestStatus(id, status) {
        return prisma.businessHelpRequest.update({
            where: { id },
            data: { status: status },
            include: { requester: { include: userInclude } },
        });
    }
}
function toRequestDto(r) {
    return {
        id: r.id,
        requesterId: r.requesterId,
        floorId: r.floorId,
        category: r.category,
        title: r.title,
        description: r.description,
        status: r.status,
        requester: r.requester ? toUserProfileDto(r.requester) : undefined,
        createdAt: r.createdAt.toISOString(),
    };
}
export class BusinessHelpService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    createRequest(requesterId, data) {
        return this.repo.createRequest({ requesterId, ...data }).then(toRequestDto);
    }
    createOffer(offererId, data) {
        return this.repo.createOffer({ offererId, ...data });
    }
    listRequests(floorId) {
        return this.repo.findRequests(floorId).then((items) => items.map(toRequestDto));
    }
    listOffers() {
        return this.repo.findOffers();
    }
    async match(requestId, offerId) {
        const match = await this.repo.createMatch(requestId, offerId);
        eventBus.emit('business-help.matched', {
            requestId,
            offerId,
            requesterId: match.request.requesterId,
            offererId: match.offer.offererId,
        });
        return match;
    }
    scheduleMeeting(matchId, scheduledAt, location, notes) {
        return this.repo.scheduleMeeting(matchId, new Date(scheduledAt), location, notes);
    }
    updateStatus(id, status) {
        return this.repo.updateRequestStatus(id, status).then(toRequestDto);
    }
}
