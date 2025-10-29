#!/usr/bin/env node
/**
 * Cron Job Server
 * Runs scheduled sync jobs for Google Drive to Supabase
 */

import cron from 'node-cron';
import { validateConfig, config } from './src/config/index.js';
import syncService from './src/sync.js';

console.log('🚀 RAG Google Drive - Cron Job Server');
console.log('='.repeat(50));
console.log('📋 Mode: Incremental Sync (only new/modified files)');
console.log('='.repeat(50));

// Validate configuration
try {
  validateConfig();
  console.log('✅ Configuration validated successfully');
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  console.error('Please check your .env file and make sure all required variables are set.');
  process.exit(1);
}

// Check if we should run once or start cron scheduler
const runMode = process.argv[2];

if (runMode === 'once') {
  // Run sync once and exit
  console.log('\n🔄 Running incremental sync once (no scheduling)...');
  console.log('💡 Only new or modified files will be processed\n');
  syncService.run()
    .then(() => {
      console.log('✅ Sync completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
} else {
  // Start cron scheduler
  console.log(`⏰ Cron schedule: ${config.cron.schedule}`);
  console.log('📅 Next run will be scheduled according to cron pattern');
  console.log('💡 Only new or modified files will be synced on each run\n');

  // Schedule the cron job
  cron.schedule(config.cron.schedule, async () => {
    console.log('\n⏰ Cron job triggered at:', new Date().toLocaleString());
    console.log('─'.repeat(50));
    try {
      await syncService.run();
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
    console.log('─'.repeat(50) + '\n');
  });

  // Optionally run initial sync on startup
  if (config.cron.runOnStartup !== false) {
    console.log('🔄 Running initial incremental sync on startup...');
    console.log('💡 Checking for new or modified files...\n');
    syncService.run().catch((error) => {
      console.error('❌ Initial sync failed:', error);
    });
  }

  console.log('✅ Cron job scheduler is running');
  console.log('⏹️  Press Ctrl+C to stop\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

