export function normalizeCompany(name) {
    const trimmed = name?.trim();
    return trimmed || null;
}
export function canViewCoop(chore, viewer) {
    if (chore.requesterId === viewer.userId)
        return true;
    if (chore.volunteerId === viewer.userId)
        return true;
    return matchesAudience(chore, viewer);
}
export function canVolunteerForCoop(chore, viewer) {
    if (chore.requesterId === viewer.userId)
        return false;
    if (chore.volunteerId)
        return false;
    return matchesAudience(chore, viewer);
}
function matchesAudience(chore, viewer) {
    const viewerCompany = normalizeCompany(viewer.companyName);
    const requesterCompany = normalizeCompany(chore.requesterCompanyName);
    switch (chore.audienceType) {
        case 'OPEN':
            return true;
        case 'MY_COMPANY':
            return Boolean(viewerCompany && requesterCompany && viewerCompany === requesterCompany);
        case 'OTHER_COMPANY':
            return Boolean(viewerCompany && normalizeCompany(chore.targetCompanyName) === viewerCompany);
        case 'SPECIFIC_USER':
            return chore.targetUserId === viewer.userId;
        default:
            return false;
    }
}
