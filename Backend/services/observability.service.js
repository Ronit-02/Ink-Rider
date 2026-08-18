const config = require('../config/config.js');

const toFinitePositive = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const slowRequestThresholdMs = toFinitePositive(config.SLOW_REQUEST_MS, 1000);
const slowQueryThresholdMs = toFinitePositive(config.SLOW_QUERY_MS, 250);
const responseBudgetMs = toFinitePositive(config.RESPONSE_BUDGET_MS, 1000);
const errorMonitorTimeoutMs = toFinitePositive(config.ERROR_MONITOR_TIMEOUT_MS, 2000);

// These are diagnostic budgets, not client-visible timeouts. They keep the
// highest-volume discovery reads tighter while allowing durable writes and
// provider callbacks enough time for their expected database work.
const responseBudgetRules = [
  { method: 'GET', prefix: '/api/post/feed', budgetMs: 750 },
  { method: 'GET', prefix: '/api/search', budgetMs: 750 },
  { method: 'GET', prefix: '/api/post/shorts', budgetMs: 750 },
  { method: 'POST', prefix: '/api/v1/events', budgetMs: 500 },
  { method: 'POST', prefix: '/api/v1/billing/webhook', budgetMs: 2000 },
  { method: 'POST', prefix: '/api', budgetMs: 1500 },
  { method: 'PUT', prefix: '/api', budgetMs: 1500 },
  { method: 'PATCH', prefix: '/api', budgetMs: 1500 },
  { method: 'DELETE', prefix: '/api', budgetMs: 1500 },
];

const getResponseBudgetMs = (req, fallback = responseBudgetMs) => {
  const rule = responseBudgetRules.find(candidate => (
    candidate.method === req?.method && req?.path?.startsWith(candidate.prefix)
  ));
  return rule?.budgetMs || fallback;
};

const requestDurationMs = startedAt => Number(process.hrtime.bigint() - startedAt) / 1_000_000;

const reportMonitorSafely = (monitor, payload) => {
  if (typeof monitor?.report !== 'function') return;
  Promise.resolve()
    .then(() => monitor.report(payload))
    .catch(() => {});
};

const createRequestTimingMiddleware = ({ thresholdMs = slowRequestThresholdMs, budgetMs, monitor, warn = console.warn } = {}) => (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestBudgetMs = budgetMs || getResponseBudgetMs(req);
  res.on('finish', () => {
    const responseTimeMs = Math.round(requestDurationMs(startedAt) * 100) / 100;
    req.responseTimeMs = responseTimeMs;
    if (responseTimeMs >= requestBudgetMs) {
      const alert = {
        level: 'response_budget_exceeded',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        responseTimeMs,
        budgetMs: requestBudgetMs,
      };
      warn(JSON.stringify(alert));
      reportMonitorSafely(monitor, {
        event: 'response_budget_exceeded',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        responseTimeMs,
        budgetMs: requestBudgetMs,
      });
    } else if (responseTimeMs >= thresholdMs) {
      warn(JSON.stringify({
        level: 'slow_request',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        responseTimeMs,
      }));
    }
  });
  next();
};

const createErrorMonitor = ({ url, timeoutMs = errorMonitorTimeoutMs, fetchImpl = globalThis.fetch, warn = console.warn } = {}) => {
  if (!url || typeof fetchImpl !== 'function') return { report: async () => {} };

  return {
    report: async ({ event = 'api_error', requestId, method, path, status, responseTimeMs, budgetMs, error }) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            event,
            occurredAt: new Date().toISOString(),
            requestId: requestId || null,
            method: method || null,
            path: path || null,
            status: status || 500,
            responseTimeMs: responseTimeMs || null,
            budgetMs: budgetMs || null,
            errorName: error?.name || 'Error',
            errorCode: error?.code || null,
          }),
          signal: controller.signal,
        });
        if (!response?.ok) {
          warn(JSON.stringify({
            level: 'error_monitor_delivery_failed',
            errorName: 'MonitorHttpError',
            status: Number.isInteger(response?.status) ? response.status : null,
          }));
        }
      } catch (deliveryError) {
        warn(JSON.stringify({
          level: 'error_monitor_delivery_failed',
          errorName: deliveryError?.name || 'Error',
        }));
      } finally {
        clearTimeout(timeout);
      }
    },
  };
};

const logInternalError = (req, error, status = 500, { monitor } = {}) => {
  console.error(JSON.stringify({
    level: 'error',
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    status,
    responseTimeMs: req.responseTimeMs || null,
    errorName: error?.name || 'Error',
    errorCode: error?.code || null,
  }));
  reportMonitorSafely(monitor, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    status,
    responseTimeMs: req.responseTimeMs || null,
    error,
  });
};

const commandCollection = command => {
  if (!command || typeof command !== 'object') return null;
  const collectionCommand = ['find', 'aggregate', 'distinct', 'count', 'countDocuments', 'findAndModify', 'update', 'delete']
    .find(name => typeof command[name] === 'string');
  return collectionCommand ? command[collectionCommand] : null;
};

const createMongoQueryDiagnostics = ({ client, thresholdMs = slowQueryThresholdMs, warn = console.warn } = {}) => {
  if (!client || typeof client.on !== 'function') return () => {};

  const startedQueries = new Map();
  const onStarted = event => {
    if (event?.requestId !== undefined) startedQueries.set(event.requestId, process.hrtime.bigint());
  };
  const onFinished = (event, status) => {
    const startedAt = startedQueries.get(event?.requestId);
    if (event?.requestId !== undefined) startedQueries.delete(event.requestId);
    if (!startedAt) return;

    const durationMs = Math.round((Number(process.hrtime.bigint() - startedAt) / 1_000_000) * 100) / 100;
    if (durationMs < thresholdMs) return;
    warn(JSON.stringify({
      level: 'slow_query',
      commandName: event.commandName || 'unknown',
      collection: commandCollection(event.command),
      durationMs,
      status,
    }));
  };
  const onSucceeded = event => onFinished(event, 'succeeded');
  const onFailed = event => onFinished(event, 'failed');

  client.on('commandStarted', onStarted);
  client.on('commandSucceeded', onSucceeded);
  client.on('commandFailed', onFailed);

  return () => {
    client.off?.('commandStarted', onStarted);
    client.off?.('commandSucceeded', onSucceeded);
    client.off?.('commandFailed', onFailed);
    startedQueries.clear();
  };
};

module.exports = {
  createRequestTimingMiddleware,
  createMongoQueryDiagnostics,
  createErrorMonitor,
  logInternalError,
  requestDurationMs,
  slowRequestThresholdMs,
  slowQueryThresholdMs,
  responseBudgetMs,
  getResponseBudgetMs,
};
