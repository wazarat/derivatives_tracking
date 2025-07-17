import { CronJob } from 'cron';
import dotenv from 'dotenv';
import path from 'path';
import { cmcDerivativesWorker } from './cmcDerivativesWorker';
import { run as runHyperliquidWorker } from './hyperliquidDerivativesWorker';
import { run as runDydxWorker } from './dydxDerivativesWorker';
import { run as runDexDerivativesWorker } from './dexDerivativesWorker';
import { createRetryableWorker } from './rest_worker';

// Create retryable versions of the workers
const retryableCmcWorker = createRetryableWorker(cmcDerivativesWorker, {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
});
const retryableHyperliquidWorker = createRetryableWorker(runHyperliquidWorker, {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
});
const retryableDydxWorker = createRetryableWorker(runDydxWorker, {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
});
const retryableDexDerivativesWorker = createRetryableWorker(runDexDerivativesWorker, {
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
    
    // Run DEX derivatives worker (combines Hyperliquid and dYdX)
    const rowCountDex = await retryableDexDerivativesWorker();
    console.log(`DEX derivatives worker completed successfully. Inserted ${rowCountDex} rows.`);
    
    console.log('All derivatives workers completed successfully');
  } catch (error) {
    console.error('Error running derivatives workers:', error);
  }
}

// Schedule the job to run every 5 minutes
const job = new CronJob('*/5 * * * *', runAllWorkers);

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
