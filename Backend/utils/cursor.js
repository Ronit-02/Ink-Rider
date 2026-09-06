const MAX_CURSOR_LENGTH = 512;

const encodeCursor = value => Buffer
  .from(JSON.stringify(value), 'utf8')
  .toString('base64url');

const decodeCursor = value => {
  if (!value) return null;
  if (typeof value !== 'string' || value.length > MAX_CURSOR_LENGTH) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    return decoded && typeof decoded === 'object' && !Array.isArray(decoded)
      ? decoded
      : null;
  } catch {
    return null;
  }
};

module.exports = { encodeCursor, decodeCursor };
