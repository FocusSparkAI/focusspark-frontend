const TIMEZONE_STORAGE_KEY = 'focusspark-timezone';

const hasTimezoneOffset = (value: string) => /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());

export function getDeviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getUserTimeZone() {
  return localStorage.getItem(TIMEZONE_STORAGE_KEY) || getDeviceTimeZone();
}

export function setUserTimeZone(timeZone: unknown) {
  if (typeof timeZone !== 'string' || !timeZone.trim()) return;
  localStorage.setItem(TIMEZONE_STORAGE_KEY, timeZone.trim());
  window.dispatchEvent(new Event('focusspark-timezone-change'));
}

export function parseBackendDate(value: string | Date) {
  if (value instanceof Date) return value;
  const source = String(value).trim();
  return new Date(hasTimezoneOffset(source) ? source : `${source}Z`);
}

export function formatUserDateTime(value: string | Date) {
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: getUserTimeZone(),
  }).format(date);
}

export function formatUserDate(value: string | Date) {
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: getUserTimeZone(),
  }).format(date);
}

export function formatUserDateKey(value: string | Date, timeZone = getUserTimeZone()) {
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '00';
  const day = parts.find((part) => part.type === 'day')?.value ?? '00';
  return `${year}-${month}-${day}`;
}

export function formatUserMonth(value: string | Date) {
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: getUserTimeZone(),
  }).format(date);
}

export function formatUserTime(value: string | Date) {
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: getUserTimeZone(),
  }).format(date);
}
