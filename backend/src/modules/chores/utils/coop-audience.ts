import type { CoopAudienceType } from '@building-app/shared';

export function normalizeCompany(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed || null;
}

interface CoopParticipantContext {
  requesterId: string;
  volunteerId?: string | null;
  audienceType: CoopAudienceType;
  targetCompanyName?: string | null;
  targetUserId?: string | null;
  requesterCompanyName?: string | null;
}

interface ViewerContext {
  userId: string;
  companyName?: string | null;
}

export function canViewCoop(chore: CoopParticipantContext, viewer: ViewerContext): boolean {
  if (chore.requesterId === viewer.userId) return true;
  if (chore.volunteerId === viewer.userId) return true;
  return matchesAudience(chore, viewer);
}

export function canVolunteerForCoop(chore: CoopParticipantContext, viewer: ViewerContext): boolean {
  if (chore.requesterId === viewer.userId) return false;
  if (chore.volunteerId) return false;
  return matchesAudience(chore, viewer);
}

function matchesAudience(chore: CoopParticipantContext, viewer: ViewerContext): boolean {
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
