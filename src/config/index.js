import dotenv from 'dotenv';

dotenv.config();

export const config = {
  google: {
    // Service Account (preferred for automation)
    serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE || null,
    // OAuth2 (fallback)
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '0 2 * * *', // Default: 2 AM daily
    runOnStartup: process.env.CRON_RUN_ON_STARTUP !== 'false', // Default: true
  },
  drive: {
    folderId: process.env.DRIVE_FOLDER_ID || null,
  },
  user: {
    teacherId: process.env.TEACHER_ID || null,
    userId: process.env.USER_ID || null,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_KEY',
];

export function validateConfig() {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName].includes('your_')
  );

  if (missingVars.length > 0) {
    console.error('\n❌ Configuration Error!\n');
    console.error(`Missing or invalid environment variables: ${missingVars.join(', ')}\n`);
    console.error('📝 To fix this:\n');
    console.error('1. Make sure .env file exists (copy from env.sample if needed)');
    console.error('2. Fill in all required credentials in .env');
    console.error('3. Run: npm run check (to verify configuration)\n');
    console.error('💡 For detailed setup instructions, see README.md or QUICKSTART.md\n');
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate Google Drive authentication
  const hasServiceAccount = config.google.serviceAccountFile;
  const hasOAuth = config.google.clientId && config.google.clientSecret && config.google.refreshToken;

  if (!hasServiceAccount && !hasOAuth) {
    console.error('\n❌ Google Drive Authentication Error!\n');
    console.error('You must configure one of the following:\n');
    console.error('Option 1 (Recommended): Service Account');
    console.error('  - Set GOOGLE_SERVICE_ACCOUNT_FILE in .env');
    console.error('  - Point to your service account JSON file\n');
    console.error('Option 2: OAuth2');
    console.error('  - Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET');
    console.error('  - Run: npm run setup to get GOOGLE_REFRESH_TOKEN\n');
    
    throw new Error('No valid Google Drive authentication configured');
  }
}

