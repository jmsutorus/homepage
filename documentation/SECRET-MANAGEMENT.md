# Secret Management Guide

This document provides comprehensive guidance on managing secrets for the Homepage application using Google Cloud Platform (GCP) Secret Manager.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [GCP Setup](#gcp-setup)
- [Secret Lifecycle](#secret-lifecycle)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Overview

The application uses a **dual-tier secret management strategy**:

- **Production (Firebase App Hosting)**: Secrets fetched from GCP Secret Manager at build time
- **Local Development**: Secrets loaded from `.env.local` file
- **CI/CD**: Build validation without real secrets (skips secret fetching)

### Benefits

- **Enhanced Security**: No secrets committed to version control
- **Easy Rotation**: Update secrets in GCP without code changes
- **Audit Trail**: GCP Cloud Audit Logs track all secret access
- **Cost-Effective**: ~$1/month for 15 secrets
- **Zero Runtime Overhead**: Secrets loaded at build time only
- **Type Safety**: Existing Zod validation preserved

## Architecture

### Secret Flow

```
Production Build:
  GCP Secret Manager → prebuild script → process.env → Zod validation → Next.js build

Local Development:
  .env.local → prebuild script → process.env → Zod validation → Next.js build

CI/CD:
  SKIP_SECRET_FETCH=true → prebuild script (skipped) → Next.js build
```

### Authentication Methods

| Environment | Authentication Method | Configuration |
|-------------|----------------------|---------------|
| Firebase App Hosting | Workload Identity Federation | Automatic (no keys) |
| Local Development | Application Default Credentials or .env.local | gcloud auth or file-based |
| CI/CD (GitHub Actions) | Skip secret fetching | `SKIP_SECRET_FETCH=true` |

## GCP Setup

### Prerequisites

- GCP project with billing enabled
- Firebase App Hosting configured
- `gcloud` CLI installed and authenticated

### Step 1: Create Secrets in GCP

```bash
# Set your project ID
export GCP_PROJECT_ID="your-firebase-project-id"
gcloud config set project $GCP_PROJECT_ID

# Create all 15 secrets
gcloud secrets create homepage-prod-database-auth-token --replication-policy="automatic"
gcloud secrets create homepage-prod-nextauth-secret --replication-policy="automatic"
gcloud secrets create homepage-prod-firebase-private-key --replication-policy="automatic"
gcloud secrets create homepage-prod-firebase-client-email --replication-policy="automatic"
gcloud secrets create homepage-prod-auth-google-secret --replication-policy="automatic"
gcloud secrets create homepage-prod-auth-github-secret --replication-policy="automatic"
gcloud secrets create homepage-prod-auth-strava-secret --replication-policy="automatic"
gcloud secrets create homepage-prod-google-client-secret --replication-policy="automatic"
gcloud secrets create homepage-prod-steam-api-key --replication-policy="automatic"
gcloud secrets create homepage-prod-github-token --replication-policy="automatic"
gcloud secrets create homepage-prod-omdb-api-key --replication-policy="automatic"
gcloud secrets create homepage-prod-google-books-api-key --replication-policy="automatic"
gcloud secrets create homepage-prod-homeassistant-token --replication-policy="automatic"
gcloud secrets create homepage-prod-tautulli-api-key --replication-policy="automatic"
gcloud secrets create homepage-prod-strava-client-secret --replication-policy="automatic"
```

### Step 2: Add Secret Values

```bash
# For simple secrets (single line)
echo -n "your-secret-value" | gcloud secrets versions add homepage-prod-database-auth-token --data-file=-

# For multiline secrets (e.g., Firebase private key)
cat firebase-key.pem | gcloud secrets versions add homepage-prod-firebase-private-key --data-file=-

# Interactive mode
gcloud secrets versions add homepage-prod-nextauth-secret
# (paste the secret, press Ctrl+D when done)
```

### Step 3: Configure IAM Permissions

Grant the Firebase App Hosting service account access to secrets:

```bash
# Get the service account (format: firebase-app-hosting@{project}.iam.gserviceaccount.com)
export SERVICE_ACCOUNT="firebase-app-hosting@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

# Grant access to all secrets
for secret in database-auth-token nextauth-secret firebase-private-key firebase-client-email \
              auth-google-secret auth-github-secret auth-strava-secret google-client-secret \
              steam-api-key github-token omdb-api-key google-books-api-key \
              homeassistant-token tautulli-api-key strava-client-secret; do
  gcloud secrets add-iam-policy-binding homepage-prod-${secret} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 4: Verify Setup

```bash
# List secrets
gcloud secrets list | grep homepage-prod

# View secret metadata
gcloud secrets describe homepage-prod-database-auth-token

# Check IAM policy
gcloud secrets get-iam-policy homepage-prod-database-auth-token
```

## Secret Lifecycle

### Adding a New Secret

**1. Create the secret in GCP:**
```bash
gcloud secrets create homepage-prod-my-new-secret --replication-policy="automatic"
echo -n "secret-value" | gcloud secrets versions add homepage-prod-my-new-secret --data-file=-
```

**2. Grant access to Firebase App Hosting:**
```bash
gcloud secrets add-iam-policy-binding homepage-prod-my-new-secret \
  --member="serviceAccount:firebase-app-hosting@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**3. Update `scripts/fetch-secrets.ts`:**
```typescript
const SECRET_MAPPINGS: Record<string, string> = {
  // ... existing mappings
  MY_NEW_SECRET: 'homepage-prod-my-new-secret',
};

// If optional, add to:
const OPTIONAL_SECRETS = new Set([
  // ... existing optional secrets
  'MY_NEW_SECRET',
]);
```

**4. Update `lib/env.ts` Zod schema:**
```typescript
server: {
  // ... existing schema
  MY_NEW_SECRET: z.string().min(1),
}
```

**5. Update `.env.example`:**
```bash
# My New Service
MY_NEW_SECRET="example-value"
```

**6. Redeploy your application**

### Rotating a Secret

**Method 1: Using gcloud CLI**
```bash
# Add a new version (automatically becomes latest)
echo -n "new-secret-value" | gcloud secrets versions add homepage-prod-database-auth-token --data-file=-

# Verify the new version
gcloud secrets versions list homepage-prod-database-auth-token

# Redeploy your application to pick up the new version
firebase deploy --only hosting
```

**Method 2: Using GCP Console**
1. Navigate to [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Click on the secret name
3. Click "New Version"
4. Enter the new secret value
5. Click "Add New Version"
6. Redeploy your application

**Method 3: Using helper script**
```bash
# Interactive rotation
tsx scripts/rotate-secret.ts homepage-prod-database-auth-token
```

### Deleting a Secret

**Warning**: Only delete secrets that are no longer used by the application.

```bash
# Delete the secret entirely
gcloud secrets delete homepage-prod-old-secret

# Or disable (soft delete) a specific version
gcloud secrets versions disable 2 --secret=homepage-prod-database-auth-token
```

## Local Development

### Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your local secrets:**
   Edit `.env.local` with your development credentials

3. **Run the development server:**
   ```bash
   npm run dev
   ```

The `prebuild` script automatically detects local development and loads secrets from `.env.local`.

### Using GCP Secrets Locally (Optional)

If you want to test with production secrets locally:

1. **Authenticate with GCP:**
   ```bash
   gcloud auth application-default login
   ```

2. **Set project ID:**
   ```bash
   export FIREBASE_PROJECT_ID="your-project-id"
   # or
   export GCP_PROJECT="your-project-id"
   ```

3. **Test secret fetching:**
   ```bash
   tsx scripts/test-secret-fetch.ts
   ```

4. **Build with GCP secrets:**
   ```bash
   npm run build
   ```

The script will detect GCP authentication and fetch secrets from Secret Manager instead of `.env.local`.

## Production Deployment

### Firebase App Hosting

1. **Update `apphosting.yaml`** with your configuration:
   - Set correct URLs for `NEXTAUTH_URL`, `DATABASE_URL`, etc.
   - Fill in public client IDs and non-secret values
   - **Do NOT add secrets** to this file

2. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Deployment flow:**
   ```
   firebase deploy
     ↓
   Build starts on Firebase App Hosting
     ↓
   prebuild script runs (scripts/fetch-secrets.ts)
     ↓
   Detects GCP environment (FIREBASE_CONFIG)
     ↓
   Uses Workload Identity to authenticate
     ↓
   Fetches secrets from GCP Secret Manager
     ↓
   Populates process.env
     ↓
   next build runs
     ↓
   lib/env.ts validates with Zod
     ↓
   Build succeeds
     ↓
   Deploy completes
   ```

## Troubleshooting

### Error: "Failed to fetch required secret"

**Cause**: Secret doesn't exist or no permission to access it.

**Solution**:
```bash
# Check if secret exists
gcloud secrets list | grep <secret-name>

# Check IAM permissions
gcloud secrets get-iam-policy <secret-name>

# Grant access if needed
gcloud secrets add-iam-policy-binding <secret-name> \
  --member="serviceAccount:firebase-app-hosting@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Error: "Missing FIREBASE_PROJECT_ID or GCP_PROJECT"

**Cause**: Project ID not set in environment.

**Solution**:
```bash
# For local development
export FIREBASE_PROJECT_ID="your-project-id"

# For Firebase App Hosting
# Add to apphosting.yaml:
env:
  - variable: FIREBASE_PROJECT_ID
    value: "your-project-id"
```

### Error: "No .env.local found and not in GCP environment"

**Cause**: Running locally without `.env.local` or GCP credentials.

**Solution**:
```bash
# Create .env.local
cp .env.example .env.local

# Or authenticate with GCP
gcloud auth application-default login
```

### Build fails in CI/CD

**Cause**: CI tries to fetch secrets but doesn't have GCP access.

**Solution**: Verify `.github/workflows/ci.yml` has:
```yaml
env:
  SKIP_SECRET_FETCH: true
  SKIP_ENV_VALIDATION: true
```

### Zod validation fails

**Cause**: Fetched secret doesn't match schema.

**Solution**:
1. Verify secret value is correct:
   ```bash
   gcloud secrets versions access latest --secret=<secret-name>
   ```

2. Check Zod schema in `lib/env.ts` matches expected format

3. For optional secrets, ensure they're in `OPTIONAL_SECRETS` set

### Permission Denied (Error Code 7)

**Cause**: Service account doesn't have Secret Manager access.

**Solution**:
```bash
# Check current IAM policy
gcloud secrets get-iam-policy <secret-name>

# Grant the role
gcloud secrets add-iam-policy-binding <secret-name> \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

### Secret Not Found (Error Code 5)

**Cause**: Secret doesn't exist in GCP.

**Solution**:
```bash
# Create the secret
gcloud secrets create <secret-name> --replication-policy="automatic"

# Add a version
echo -n "secret-value" | gcloud secrets versions add <secret-name> --data-file=-
```

## Security Best Practices

### Do's

- **Do** use separate secrets for staging and production
- **Do** rotate secrets regularly (at least every 90 days)
- **Do** use least-privilege IAM roles (`secretAccessor` only)
- **Do** enable Cloud Audit Logs for secret access tracking
- **Do** use Workload Identity instead of service account keys when possible
- **Do** validate secret format in Zod schemas
- **Do** keep `.env.local` in `.gitignore`

### Don'ts

- **Don't** commit `.env.local` or `.env` files to version control
- **Don't** store service account key files in the repository
- **Don't** share secrets via email, Slack, or other insecure channels
- **Don't** log secret values (even in debug mode)
- **Don't** use production secrets in local development
- **Don't** grant `secretmanager.admin` role to service accounts
- **Don't** hardcode secrets in application code

### Access Control

**Recommended IAM Roles:**

| Role | Who | Permissions |
|------|-----|-------------|
| `roles/secretmanager.admin` | DevOps admins only | Full secret management |
| `roles/secretmanager.secretAccessor` | Firebase App Hosting service account | Read secret values |
| `roles/secretmanager.viewer` | Developers | List/view metadata (not values) |

**Grant access principle**: Only grant the minimum permissions needed.

### Audit Logging

Enable and monitor Cloud Audit Logs:

```bash
# View recent secret access
gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" \
  --limit 50 \
  --format json

# Set up log-based alerts
gcloud alpha logging metrics create secret-access-spike \
  --description="Alert on unusual secret access patterns" \
  --log-filter='resource.type="secretmanager.googleapis.com/Secret"'
```

### Secret Rotation Policy

**Recommended schedule:**
- **Critical secrets** (database credentials, session keys): Every 30 days
- **OAuth secrets**: Every 90 days
- **API keys**: Every 180 days or when provider requires

**After rotation:**
1. Update secret in GCP Secret Manager
2. Redeploy application
3. Verify application works
4. Disable old secret version (for rollback capability)
5. Delete old version after 7 days

## Cost Considerations

### GCP Secret Manager Pricing

- **Active secret versions**: $0.06 per secret version per month
- **Access operations**: $0.03 per 10,000 operations

### Estimated Monthly Cost

For this application (15 secrets, ~100 builds/month):
- 15 secrets × 1 version = 15 versions × $0.06 = **$0.90/month**
- 100 builds × 15 secrets = 1,500 operations × $0.03/10,000 = **$0.005/month**
- **Total: ~$0.91/month**

Extremely cost-effective for the security benefits!

## Advanced Topics

### Using Different Environments

To support staging and production:

**1. Use environment-specific secret names:**
```typescript
const environment = process.env.DEPLOY_ENV || 'prod';
const SECRET_MAPPINGS = {
  DATABASE_AUTH_TOKEN: `homepage-${environment}-database-auth-token`,
  // ...
};
```

**2. Set `DEPLOY_ENV` in `apphosting.yaml`:**
```yaml
env:
  - variable: DEPLOY_ENV
    value: "staging"  # or "prod"
```

### Secret Versioning

GCP Secret Manager supports multiple versions:

```bash
# List all versions
gcloud secrets versions list homepage-prod-database-auth-token

# Access specific version
gcloud secrets versions access 2 --secret=homepage-prod-database-auth-token

# Use specific version in code (advanced)
# Modify SECRET_MAPPINGS to include version:
const secretPath = `projects/${projectId}/secrets/${secretName}/versions/2`;
```

### Automated Secret Rotation

For automated rotation (e.g., via Cloud Scheduler + Cloud Functions):

```typescript
// Cloud Function example
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function rotateSecret(secretName: string, newValue: string) {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT;

  await client.addSecretVersion({
    parent: `projects/${projectId}/secrets/${secretName}`,
    payload: { data: Buffer.from(newValue, 'utf8') },
  });

  // Trigger redeployment
  // (implementation depends on your CD setup)
}
```

## FAQ

**Q: Can I use this locally without GCP access?**
A: Yes! The script automatically falls back to `.env.local` when GCP credentials aren't available.

**Q: What happens if a secret fetch fails?**
A: Required secrets will fail the build. Optional secrets (Steam, Strava, etc.) will log a warning and continue.

**Q: Do I need to rebuild when rotating secrets?**
A: Yes, secrets are fetched at build time. Update the secret in GCP, then redeploy your application.

**Q: Can I see secret values in GCP Console?**
A: Yes, if you have the `secretmanager.secretAccessor` role. Navigate to Secret Manager and click "View Secret Value".

**Q: How do I migrate existing secrets to GCP?**
A: Copy values from your current `.env.local`, create secrets in GCP, then verify with `tsx scripts/test-secret-fetch.ts`.

**Q: What about NEXT_PUBLIC_* variables?**
A: These must remain as environment variables because Next.js bakes them into the client bundle at build time. They're not secrets anyway (visible in browser).

**Q: How do I handle multiline secrets like SSH keys?**
A: Use `cat file.pem | gcloud secrets versions add SECRET_NAME --data-file=-`. The script preserves newlines.

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [implementation plan](/root/.claude/plans/vectorized-kindling-lightning.md)
3. Test with `tsx scripts/test-secret-fetch.ts`
4. Enable debug mode: `DEBUG_SECRETS=true npm run build`

## Related Documentation

- [GCP Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Firebase App Hosting Documentation](https://firebase.google.com/docs/app-hosting)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
