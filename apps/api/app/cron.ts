import { CronJob } from 'cron';
import dotenv from 'dotenv';
import path from 'path';
import { run as runHyperliquidDerivativesWorker } from './workers/hyperliquidDerivativesWorker';
import { run as runDexDerivativesWorker } from './workers/dexDerivativesWorker';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Schedule the workers to run every 15 minutes
const job = new CronJob('*/15 * * * *', async () => {
  console.log('Running derivatives workers...');
  
  try {
    // Run Hyperliquid worker
    console.log('Running Hyperliquid derivatives worker...');
    const hyperliquidResult = await runHyperliquidDerivativesWorker();
    console.log(`Hyperliquid worker completed: ${hyperliquidResult} rows processed`);
    
    // Run DEX derivatives worker
    console.log('Running DEX derivatives worker...');
    const dexResult = await runDexDerivativesWorker();
    console.log(`DEX derivatives worker completed: ${dexResult} rows processed`);
  } catch (error) {
    console.error('Error running derivatives workers:', error);
  }
});

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

// Run the job immediately on startup if this file is executed directly
if (require.main === module) {
  job.fireOnTick();
}
