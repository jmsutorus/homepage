import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * Test script to verify GCP Secret Manager connection and access
 */
async function testSecretFetch() {
  console.log('🔍 Testing GCP Secret Manager connection...\n');

  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT;

    if (!projectId) {
      console.error('❌ Missing FIREBASE_PROJECT_ID or GCP_PROJECT environment variable');
      console.log('\nSet one of these environment variables:');
      console.log('  export FIREBASE_PROJECT_ID="your-project-id"');
      console.log('  export GCP_PROJECT="your-project-id"');
      process.exit(1);
    }

    console.log(`📦 Project ID: ${projectId}\n`);

    // Test fetching a known secret (database auth token)
    console.log('Testing secret access...');
    const testSecretName = 'homepage-prod-database-auth-token';

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${testSecretName}/versions/latest`,
    });

    const secretLength = version.payload?.data?.length || 0;

    console.log('✅ Successfully connected to GCP Secret Manager');
    console.log(`✅ Successfully fetched test secret: ${testSecretName}`);
    console.log(`   Secret length: ${secretLength} bytes`);

    // List available secrets for this project
    console.log('\n📋 Listing available secrets in project...');
    try {
      const [secrets] = await client.listSecrets({
        parent: `projects/${projectId}`,
        filter: 'name:homepage-prod-',
      });

      if (secrets.length === 0) {
        console.log('⚠  No secrets found with prefix "homepage-prod-"');
        console.log('   Run the GCP setup commands from the implementation plan');
      } else {
        console.log(`   Found ${secrets.length} homepage secrets:`);
        secrets.forEach(secret => {
          const secretName = secret.name?.split('/').pop();
          console.log(`   - ${secretName}`);
        });
      }
    } catch (listError: any) {
      console.warn(`⚠  Could not list secrets: ${listError.message}`);
      console.warn('   (This is optional - your service account may not have list permissions)');
    }

    console.log('\n✅ All tests passed! GCP Secret Manager is configured correctly.');
    console.log('\nYou can now run:');
    console.log('  npm run build  (to build with secret fetching)');
    console.log('  tsx scripts/fetch-secrets.ts  (to test secret fetching standalone)');

  } catch (error: any) {
    console.error('\n❌ Failed to connect to GCP Secret Manager\n');
    console.error(`Error: ${error.message}\n`);

    console.log('Troubleshooting steps:');
    console.log('─'.repeat(50));

    console.log('\n1️⃣  Authenticate with GCP:');
    console.log('   gcloud auth application-default login');

    console.log('\n2️⃣  Verify project ID is set:');
    console.log('   gcloud config get-value project');

    console.log('\n3️⃣  Check if secrets exist:');
    console.log('   gcloud secrets list | grep homepage-prod');

    console.log('\n4️⃣  Verify IAM permissions:');
    console.log('   gcloud secrets get-iam-policy homepage-prod-database-auth-token');

    console.log('\n5️⃣  Test secret access manually:');
    console.log('   gcloud secrets versions access latest --secret="homepage-prod-database-auth-token"');

    console.log('\n6️⃣  If secrets don\'t exist, create them:');
    console.log('   # See the GCP Secret Manager Setup section in the implementation plan');

    console.log('\n' + '─'.repeat(50));

    if (error.code === 5) {
      console.log('\n⚠  Error code 5 = NOT_FOUND');
      console.log('   The secret does not exist. Create it with:');
      console.log('   gcloud secrets create homepage-prod-database-auth-token --replication-policy="automatic"');
    } else if (error.code === 7) {
      console.log('\n⚠  Error code 7 = PERMISSION_DENIED');
      console.log('   Your account/service account does not have permission to access secrets.');
      console.log('   Grant the "Secret Manager Secret Accessor" role.');
    } else if (error.code === 16) {
      console.log('\n⚠  Error code 16 = UNAUTHENTICATED');
      console.log('   Run: gcloud auth application-default login');
    }

    process.exit(1);
  }
}

// Run the test
testSecretFetch();
