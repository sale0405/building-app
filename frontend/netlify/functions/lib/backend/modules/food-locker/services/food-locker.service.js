import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import { eventBus } from '../../../core/events/event-bus.js';
export class FoodLockerRepository {
    create(data) {
        return prisma.foodListing.create({
            data: {
                sellerId: data.sellerId,
                floorId: data.floorId,
                lockerNumber: data.lockerNumber,
                title: data.title,
                quantity: data.quantity,
                expirationDate: data.expirationDate,
                price: data.price,
                photos: data.photos ? { create: data.photos } : undefined,
            },
            include: { seller: { include: userInclude }, photos: true },
        });
    }
    findMany(floorId, status) {
        return prisma.foodListing.findMany({
            where: {
                deletedAt: null,
                ...(floorId ? { floorId } : {}),
                ...(status ? { status: status } : {}),
            },
            include: { seller: { include: userInclude }, photos: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findById(id) {
        return prisma.foodListing.findFirst({
            where: { id, deletedAt: null },
            include: { seller: { include: userInclude }, photos: true },
        });
    }
    reserve(listingId, buyerId) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return prisma.$transaction([
            prisma.foodListing.update({
                where: { id: listingId, status: 'AVAILABLE' },
                data: { status: 'RESERVED' },
            }),
            prisma.foodReservation.create({
                data: { listingId, buyerId, expiresAt },
            }),
        ]);
    }
    markSold(listingId) {
        return prisma.foodListing.update({
            where: { id: listingId },
            data: { status: 'SOLD' },
            include: { seller: { include: userInclude }, photos: true },
        });
    }
    addRating(data) {
        return prisma.foodRating.create({ data });
    }
    softDelete(id) {
        return prisma.foodListing.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'EXPIRED' },
        });
    }
}
function toDto(listing, storageUrl) {
    return {
        id: listing.id,
        sellerId: listing.sellerId,
        floorId: listing.floorId,
        lockerNumber: listing.lockerNumber,
        title: listing.title,
        quantity: listing.quantity,
        expirationDate: listing.expirationDate.toISOString(),
        price: Number(listing.price),
        status: listing.status,
        photos: listing.photos.map((p) => ({
            id: p.id,
            url: storageUrl(p.storageKey),
            sortOrder: p.sortOrder,
        })),
        seller: listing.seller ? toUserProfileDto(listing.seller) : undefined,
        createdAt: listing.createdAt.toISOString(),
    };
}
export class FoodLockerService {
    repo;
    storageUrl;
    constructor(repo, storageUrl) {
        this.repo = repo;
        this.storageUrl = storageUrl;
    }
    async create(sellerId, data) {
        const listing = await this.repo.create({
            sellerId,
            ...data,
            expirationDate: new Date(data.expirationDate),
        });
        const dto = toDto(listing, this.storageUrl);
        eventBus.emit('food-locker.listing.created', { listing: dto, floorId: data.floorId });
        return dto;
    }
    list(floorId, status) {
        return this.repo.findMany(floorId, status).then((items) => items.map((l) => toDto(l, this.storageUrl)));
    }
    async getById(id) {
        const listing = await this.repo.findById(id);
        if (!listing)
            throw new Error('Listing not found');
        return toDto(listing, this.storageUrl);
    }
    async reserve(listingId, buyerId) {
        const listing = await this.repo.findById(listingId);
        if (!listing || listing.status !== 'AVAILABLE')
            throw new Error('Not available');
        await this.repo.reserve(listingId, buyerId);
        eventBus.emit('food-locker.item.reserved', {
            listingId,
            buyerId,
            sellerId: listing.sellerId,
        });
        return this.getById(listingId);
    }
    async markSold(listingId, userId) {
        const listing = await this.repo.findById(listingId);
        if (!listing)
            throw new Error('Listing not found');
        if (listing.sellerId !== userId)
            throw new Error('Only seller can mark sold');
        await this.repo.markSold(listingId);
        const reservation = await prisma.foodReservation.findFirst({
            where: { listingId },
            orderBy: { createdAt: 'desc' },
        });
        eventBus.emit('food-locker.item.sold', {
            listingId,
            buyerId: reservation?.buyerId ?? userId,
            sellerId: listing.sellerId,
        });
        return this.getById(listingId);
    }
    rate(listingId, buyerId, rating, comment) {
        return this.repo.findById(listingId).then((listing) => {
            if (!listing)
                throw new Error('Listing not found');
            return this.repo.addRating({ listingId, buyerId, sellerId: listing.sellerId, rating, comment });
        });
    }
    removeListing(id) {
        return this.repo.softDelete(id);
    }
}
