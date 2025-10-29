#!/usr/bin/env node

/**
 * Convert service-account.json to environment variables
 * Usage: node scripts/convert-service-account-to-env.js [path-to-service-account.json]
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const serviceAccountPath = args[0] || './service-account.json';

try {
  // Read service account JSON
  const fullPath = path.resolve(serviceAccountPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    console.error('\nUsage: node scripts/convert-service-account-to-env.js [path-to-service-account.json]');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  // Generate environment variables
  console.log('\n📋 Copy these environment variables to your .env file:\n');
  console.log('# Google Service Account (from JSON file)');
  console.log(`GOOGLE_SERVICE_ACCOUNT_TYPE=${serviceAccount.type || 'service_account'}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=${serviceAccount.project_id || ''}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=${serviceAccount.private_key_id || ''}`);
  
  // Escape private key for .env format
  const privateKey = (serviceAccount.private_key || '').replace(/\n/g, '\\n');
  console.log(`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="${privateKey}"`);
  
  console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${serviceAccount.client_email || ''}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=${serviceAccount.client_id || ''}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_AUTH_URI=${serviceAccount.auth_uri || 'https://accounts.google.com/o/oauth2/auth'}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_TOKEN_URI=${serviceAccount.token_uri || 'https://oauth2.googleapis.com/token'}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL=${serviceAccount.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs'}`);
  console.log(`GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url || ''}`);
  
  console.log('\n✅ Conversion complete!');
  console.log('\n💡 Tips:');
  console.log('  1. Copy the variables above to your .env file');
  console.log('  2. Remove or comment out GOOGLE_SERVICE_ACCOUNT_FILE line');
  console.log('  3. Make sure to keep the private key in quotes');
  console.log('  4. You can now delete service-account.json for security\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
