const mongoose = require('mongoose');

const isStandaloneMongoError = error => {
  const message = String(error?.message || '').toLowerCase();
  return [20, 251].includes(error?.code)
    || message.includes('transaction numbers are only allowed')
    || message.includes('replica set member')
    || message.includes('not supported');
};

// Local development may use a standalone MongoDB. Keep those environments usable,
// but never hide application errors or silently retry a partially completed workflow.
const withTransaction = async (work, { fallbackOnStandalone = true } = {}) => {
  // GitHub Actions and many local installations use a standalone MongoDB
  // process. Detect that topology before opening a transaction because MongoDB
  // rejects transaction commands on a single-node deployment.
  const topologyType = mongoose.connection?.client?.topology?.description?.type;
  if (fallbackOnStandalone && topologyType === 'Single') return work(null);

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => work(session));
  } catch (error) {
    if (!fallbackOnStandalone || !isStandaloneMongoError(error)) throw error;
    return work(null);
  } finally {
    await session.endSession();
  }
};

// Mongoose queries must not receive a literal `null` session. This helper keeps
// standalone-Mongo fallback reads outside a transaction while preserving the
// transaction session whenever one is available.
const withOptionalSession = (query, session) => (session ? query.session(session) : query);

module.exports = { withTransaction, isStandaloneMongoError, withOptionalSession };
