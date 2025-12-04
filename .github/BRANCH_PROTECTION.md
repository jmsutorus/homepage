# Branch Protection Configuration

To ensure the Release workflow must pass before PRs can be merged, configure the following branch protection rules for the `main` branch:

## Setup Instructions

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Configure the following settings:

### Branch name pattern
```
main
```

### Required Status Checks

Enable **"Require status checks to pass before merging"** and select:
- ✅ **Release** (the release workflow)
- ✅ **Linting** (from CI workflow)
- ✅ **Testing** (from CI workflow)

### Additional Recommended Settings

- ✅ **Require branches to be up to date before merging**
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**

## Current Workflows

- **CI Workflow** (`.github/workflows/ci.yml`):
  - Runs on all PRs to `main`
  - Jobs: Linting, Testing

- **Release Workflow** (`.github/workflows/release.yml`):
  - **On PRs**: Runs in **dry-run mode** (validates without releasing)
  - **On push to main**: Creates actual releases
  - This ensures release validation happens before merge, and actual releases happen after merge

## What Does Dry-Run Mode Check?

The release validation will ensure:
- ✅ Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- ✅ Release configuration is valid
- ✅ The release process would succeed
- ❌ No actual releases, tags, or changelogs are created until merged
