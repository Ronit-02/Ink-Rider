const { connectToMongoDB } = require('../utils/mongoConnect');
const { processNotificationDeliveryJobs } = require('../services/notification-delivery.service');
const config = require('../config/config');

const runOnce = async () => {
  await connectToMongoDB();
  const stats = await processNotificationDeliveryJobs({ limit: Number(process.env.NOTIFICATION_JOB_LIMIT || 20) });
  console.log(JSON.stringify(stats));
};

const run = async () => {
  await runOnce();
  if (process.env.NOTIFICATION_WORKER_CONTINUOUS !== 'true') return;
  const interval = setInterval(() => runOnce().catch(error => console.error(JSON.stringify({ level: 'error', job: 'notification-deliveries', errorCode: error?.code || 'JOB_FAILED' }))), config.NOTIFICATION_WORKER_INTERVAL_MS);
  const shutdown = () => { clearInterval(interval); process.exitCode = 0; };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
};

run().catch(error => {
  console.error(JSON.stringify({ level: 'error', job: 'notification-deliveries', errorCode: error?.code || 'JOB_FAILED' }));
  process.exitCode = 1;
});
