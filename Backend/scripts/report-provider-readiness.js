const { providerReadiness } = require('../services/provider-readiness.service');

const readiness = providerReadiness();
console.log(JSON.stringify(readiness, null, 2));
if (process.argv.includes('--strict') && readiness.missing.length) process.exitCode = 1;
