import { hr } from './hr.js';

type Dict = typeof hr;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const value = getNestedValue(hr as unknown as Record<string, unknown>, key) ?? key;
  if (!vars) return value;
  return Object.entries(vars).reduce(
    (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
    value,
  );
}

export function enumLabel(value: string): string {
  return getNestedValue(hr.enums as unknown as Record<string, unknown>, value) ?? value;
}

export function formatOffice(officeNumber: string | null | undefined): string {
  return officeNumber ? `${t('common.officeShort')} ${officeNumber}` : '';
}

export function formatUserLocation(floorLabel: string | undefined, officeNumber: string | null | undefined): string {
  const floor = floorLabel ?? t('common.noFloor');
  const office = officeNumber ? ` · ${formatOffice(officeNumber)}` : '';
  return `${floor}${office}`;
}

export type { Dict };
