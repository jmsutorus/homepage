import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mapping of environment variable names to GCP Secret Manager secret names
 */
const SECRET_MAPPINGS: Record<string, string> = {
  DATABASE_AUTH_TOKEN: 'homepage-prod-database-auth-token',
  AUTH_SECRET: 'homepage-prod-nextauth-secret',
  NEXTAUTH_SECRET: 'homepage-prod-nextauth-secret',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'homepage-prod-nextauth-api-key',
  FIREBASE_PRIVATE_KEY: 'homepage-prod-firebase-private-key',
  FIREBASE_CLIENT_EMAIL: 'homepage-prod-firebase-client-email',
  AUTH_GOOGLE_SECRET: 'homepage-prod-auth-google-secret',
  AUTH_GITHUB_SECRET: 'homepage-prod-auth-github-secret',
  AUTH_STRAVA_SECRET: 'homepage-prod-auth-strava-secret',
  GOOGLE_CLIENT_SECRET: 'homepage-prod-google-client-secret',
  STEAM_API_KEY: 'homepage-prod-steam-api-key',
  GITHUB_TOKEN: 'homepage-prod-github-token',
  OMDB_API_KEY: 'homepage-prod-omdb-api-key',
  GOOGLE_BOOKS_API_KEY: 'homepage-prod-google-books-api-key',
  HOMEASSISTANT_TOKEN: 'homepage-prod-homeassistant-token',
  TAUTULLI_API_KEY: 'homepage-prod-tautulli-api-key',
  STRAVA_CLIENT_SECRET: 'homepage-prod-strava-client-secret',
  EARTHBOUND_API_URL: 'homepage-prod-earthbound-api-url',
  FIREBASE_CURATION_FUNCTION_URL: 'homepage-prod-curation-url',
  FIREBASE_IMAGE_PROCESSING_URL: 'homepage-prod-image-processing-url',
  FIREBASE_SEND_ACCESS_EMAIL: 'homepage-prod-send-access-email-url',
  FIREBASE_WORKOUT_CURATION_URL: 'homepage-prod-workout-curation-url',
};

/**
 * Optional secrets that won't fail the build if missing
 * These are typically for integrations that can be disabled
 */
const OPTIONAL_SECRETS = new Set([
  'STEAM_API_KEY',
  'STRAVA_CLIENT_SECRET',
  'HOMEASSISTANT_TOKEN',
  'TAUTULLI_API_KEY',
  'OMDB_API_KEY',
  'GOOGLE_BOOKS_API_KEY',
]);

/**
 * Fetch a secret from GCP Secret Manager with retry logic
 */
async function fetchSecretWithRetry(
  client: SecretManagerServiceClient,
  secretPath: string,
  maxRetries = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [version] = await client.accessSecretVersion({ name: secretPath });
      return version.payload?.data?.toString() || null;
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(`  Retry ${attempt}/${maxRetries} for ${secretPath.split('/').pop()}`);
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

/**
 * Main function to fetch secrets from GCP Secret Manager or fallback to .env.local
 */
async function fetchSecrets() {
  // Skip if explicitly disabled
  if (process.env.SKIP_SECRET_FETCH === 'true') {
    console.log('✓ Secret fetching skipped (SKIP_SECRET_FETCH=true)');
    return;
  }

  // Detect if running in GCP environment
  // Firebase App Hosting sets FIREBASE_CONFIG
  // Cloud Run sets K_SERVICE
  const isGCP = !!(process.env.K_SERVICE || process.env.FIREBASE_CONFIG);

  if (!isGCP) {
    // Local development: use .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('✓ Local development: loading secrets from .env.local');
      dotenv.config({ path: envPath });
      return;
    }
    console.warn('⚠ No .env.local found and not in GCP environment');
    console.warn('  Proceeding without secrets - build may fail if secrets are required');
    return;
  }

  // Fetch from GCP Secret Manager
  console.log('🔐 Production environment: fetching secrets from GCP Secret Manager');

  const client = new SecretManagerServiceClient();

  // Try to get project ID from various sources
  let projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;

  // If running in Firebase App Hosting, try to extract from FIREBASE_CONFIG
  if (!projectId && process.env.FIREBASE_CONFIG) {
    try {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      projectId = firebaseConfig.projectId;
      console.log('  Extracted project ID from FIREBASE_CONFIG');
    } catch (error) {
      console.warn('  Failed to parse FIREBASE_CONFIG');
    }
  }

  if (!projectId) {
    throw new Error('Missing project ID. Checked: FIREBASE_PROJECT_ID, GCP_PROJECT, GCLOUD_PROJECT, FIREBASE_CONFIG');
  }

  console.log(`  Project: ${projectId}`);

  let successCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const [envVar, secretName] of Object.entries(SECRET_MAPPINGS)) {
    try {
      const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const payload = await fetchSecretWithRetry(client, secretPath);

      if (payload) {
        process.env[envVar] = payload;
        console.log(`  ✓ Loaded ${envVar}`);
        successCount++;
      } else {
        console.warn(`  ⚠ Empty payload for ${envVar}`);
      }
    } catch (error: any) {
      if (OPTIONAL_SECRETS.has(envVar)) {
        console.warn(`  ⚠ Optional secret ${envVar} not found, skipping`);
        skippedCount++;
      } else {
        const errorMsg = `Failed to fetch required secret ${envVar}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`  ✗ ${errorMsg}`);
      }
    }
  }

  // Summary
  console.log(`\n📊 Secret fetching summary:`);
  console.log(`  ✓ Loaded: ${successCount}`);
  if (skippedCount > 0) {
    console.log(`  ⚠ Skipped (optional): ${skippedCount}`);
  }
  if (errors.length > 0) {
    console.log(`  ✗ Failed: ${errors.length}`);
    console.error('\n❌ Failed to fetch required secrets:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Secret fetching failed - see errors above');
  }

  console.log('✅ All required secrets loaded successfully\n');
}

// Run if called directly
if (require.main === module) {
  fetchSecrets()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('\n❌ Fatal error:', err.message);
      console.error('\nTroubleshooting:');
      console.error('  1. Verify GCP Secret Manager is set up correctly');
      console.error('  2. Check Workload Identity permissions');
      console.error('  3. Ensure all required secrets exist in GCP');
      console.error('  4. For local development, create .env.local file');
      process.exit(1);
    });
}

export { fetchSecrets };
