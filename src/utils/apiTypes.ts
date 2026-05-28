import axios from 'axios';

export type ApiRecord = Record<string, unknown>;

export function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null;
}

export function getString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function getNumber(value: unknown, fallback = 0) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

export function getBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (isApiRecord(data)) {
      const detail = data.detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => (isApiRecord(item) ? getString(item.msg) : ''))
          .filter(Boolean);
        if (messages.length) return messages.join(', ');
      }

      return (
        getString(data.message) ||
        getString(data.detail) ||
        getString(data.error) ||
        error.message ||
        fallback
      );
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
