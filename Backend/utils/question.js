const normalizeQuestionText = value => String(value || '')
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

module.exports = { normalizeQuestionText };
