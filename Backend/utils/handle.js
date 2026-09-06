const HANDLE_MIN_LENGTH = 3;
const HANDLE_MAX_LENGTH = 30;

const normalizeHandle = value => {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, HANDLE_MAX_LENGTH)
    .replace(/-+$/g, '');

  if (normalized.length >= HANDLE_MIN_LENGTH) return normalized;
  if (normalized) return `${normalized}-writer`.slice(0, HANDLE_MAX_LENGTH);
  return 'writer';
};

const buildHandleCandidate = (baseHandle, attempt) => {
  if (attempt === 0) return baseHandle;
  const suffix = `-${attempt + 1}`;
  const stem = baseHandle
    .slice(0, HANDLE_MAX_LENGTH - suffix.length)
    .replace(/-+$/g, '');
  return `${stem}${suffix}`;
};

module.exports = {
  HANDLE_MIN_LENGTH,
  HANDLE_MAX_LENGTH,
  normalizeHandle,
  buildHandleCandidate,
};
