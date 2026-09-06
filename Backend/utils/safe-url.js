const isSafeHttpUrl = value => {
  try {
    const url = new URL(String(value));
    return ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password
      && !/[\u0000-\u001f\u007f]/.test(String(value));
  } catch {
    return false;
  }
};

module.exports = { isSafeHttpUrl };
