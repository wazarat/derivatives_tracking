"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const cmcDerivativesWorker_1 = require("./cmcDerivativesWorker");
const hyperliquidDerivativesWorker_1 = require("./hyperliquidDerivativesWorker");
const dydxDerivativesWorker_1 = require("./dydxDerivativesWorker");
const rest_worker_1 = require("./rest_worker");
// Create retryable versions of the workers
const retryableCmcWorker = (0, rest_worker_1.createRetryableWorker)(cmcDerivativesWorker_1.cmcDerivativesWorker, {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
});
const retryableHyperliquidWorker = (0, rest_worker_1.createRetryableWorker)(hyperliquidDerivativesWorker_1.run, {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
});
const retryableDydxWorker = (0, rest_worker_1.createRetryableWorker)(dydxDerivativesWorker_1.run, {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
});
// Run all workers
async function runAllWorkers() {
    console.log('Running all derivatives workers...');
    try {
        // Run CMC worker
        const rowCountCmc = await retryableCmcWorker();
        console.log(`CMC worker completed successfully. Inserted ${rowCountCmc} rows.`);
        // Run Hyperliquid worker
        const rowCountHyperliquid = await retryableHyperliquidWorker();
        console.log(`Hyperliquid worker completed successfully. Inserted ${rowCountHyperliquid} rows.`);
        // Run dYdX worker
        const rowCountDydx = await retryableDydxWorker();
        console.log(`dYdX worker completed successfully. Inserted ${rowCountDydx} rows.`);
        console.log('All derivatives workers completed successfully');
    }
    catch (error) {
        console.error('Error running derivatives workers:', error);
    }
}
// Schedule the job to run every 5 minutes
const job = new cron_1.CronJob('*/5 * * * *', runAllWorkers);
// Start the job
console.log('Starting derivatives cron job...');
job.start();
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Stopping derivatives cron job...');
    job.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('Stopping derivatives cron job...');
    job.stop();
    process.exit(0);
});
// Run the job immediately on startup
runAllWorkers();
