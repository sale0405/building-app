import type { ChoreRequestDto, UserProfileDto } from '@building-app/shared';
import { CoopAudienceType } from '@building-app/shared';

function normalizeCompany(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed || null;
}

function matchesAudience(
  chore: Pick<ChoreRequestDto, 'audienceType' | 'targetCompanyName' | 'targetUserId' | 'requester'>,
  viewer: Pick<UserProfileDto, 'userId' | 'companyName'>,
): boolean {
  const viewerCompany = normalizeCompany(viewer.companyName);
  const requesterCompany = normalizeCompany(chore.requester?.companyName);

  switch (chore.audienceType) {
    case CoopAudienceType.OPEN:
      return true;
    case CoopAudienceType.MY_COMPANY:
      return Boolean(viewerCompany && requesterCompany && viewerCompany === requesterCompany);
    case CoopAudienceType.OTHER_COMPANY:
      return Boolean(viewerCompany && normalizeCompany(chore.targetCompanyName) === viewerCompany);
    case CoopAudienceType.SPECIFIC_USER:
      return chore.targetUserId === viewer.userId;
    default:
      return false;
  }
}

export function canVolunteerForCoop(chore: ChoreRequestDto, viewer: UserProfileDto): boolean {
  if (chore.status !== 'OPEN') return false;
  if (chore.requesterId === viewer.userId) return false;
  if (chore.volunteerId) return false;
  return matchesAudience(chore, viewer);
}

export function getCoopAudienceTypeLabel(
  type: CoopAudienceType,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  switch (type) {
    case CoopAudienceType.MY_COMPANY:
      return t('chores.audienceTypeMyCompany');
    case CoopAudienceType.OTHER_COMPANY:
      return t('chores.audienceTypeOtherCompany');
    case CoopAudienceType.SPECIFIC_USER:
      return t('chores.audienceTypeSpecificUser');
    default:
      return t('chores.audienceTypeOpen');
  }
}

export function getCoopAudienceLabel(chore: ChoreRequestDto, t: (key: string, vars?: Record<string, string | number>) => string): string {
  switch (chore.audienceType) {
    case CoopAudienceType.MY_COMPANY:
      return t('chores.audienceMyCompany', { company: chore.requester?.companyName ?? '—' });
    case CoopAudienceType.OTHER_COMPANY:
      return t('chores.audienceOtherCompany', { company: chore.targetCompanyName ?? '—' });
    case CoopAudienceType.SPECIFIC_USER:
      return t('chores.audienceSpecificUser', { name: chore.targetUser?.name ?? '—' });
    default:
      return t('chores.audienceOpen');
  }
}
