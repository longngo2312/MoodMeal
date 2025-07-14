# MoodMeal Deployment Guide

This guide covers deploying the MoodMeal app to various platforms using GitHub Actions.

## Prerequisites

1. **Supabase Project**: Set up and configured
2. **GitHub Repository**: With proper secrets configured
3. **Expo Account**: For publishing (optional)

## Environment Variables

### Required Secrets in GitHub

Add these secrets to your GitHub repository:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | All builds |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | All builds |
| `EXPO_TOKEN` | Expo access token | Publishing to Expo |

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes three jobs:

### 1. Test Job
- Runs on every push and pull request
- Performs TypeScript checking
- Creates test builds
- Validates environment setup

### 2. Build Preview Job
- Runs on pull requests only
- Creates preview builds for testing
- Uses staging environment variables

### 3. Deploy Job
- Runs on main branch pushes only
- Publishes to Expo (if configured)
- Uses production environment variables

## Deployment Strategies

### 1. Expo Go (Development)

For development and testing:

```bash
# Local development
npm start

# Scan QR code with Expo Go app
```

### 2. Expo Publishing

For over-the-air updates:

```bash
# Manual publish
npx expo publish

# Automatic via GitHub Actions
git push origin main
```

### 3. App Store Builds

For production app store releases:

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## Branch Strategy

### Main Branch
- Production-ready code
- Triggers automatic deployment
- Requires pull request reviews

### Feature Branches
- Development work
- Triggers test builds only
- Must pass all checks before merging

### Pull Requests
- Triggers preview builds
- Runs full test suite
- Requires approval before merge

## Environment Management

### Development
```env
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
```

### Production
```env
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
```

## Monitoring and Rollback

### Monitoring
- Check GitHub Actions for build status
- Monitor Expo dashboard for app usage
- Review Supabase logs for API errors

### Rollback
```bash
# Rollback to previous Expo version
npx expo publish --release-channel production-v1.0.0

# Or revert Git commit and redeploy
git revert <commit-hash>
git push origin main
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **Supabase Security**
   - Enable Row Level Security (RLS)
   - Use proper API key permissions
   - Monitor usage patterns

3. **GitHub Actions**
   - Limit secret access to necessary workflows
   - Use environment protection rules
   - Review workflow permissions

## Troubleshooting

### Common Issues

1. **Build Fails - Missing Secrets**
   ```
   Error: Missing Supabase environment variables
   ```
   **Solution**: Verify GitHub secrets are properly set

2. **Expo Publish Fails**
   ```
   Error: Not logged in to Expo
   ```
   **Solution**: Add valid `EXPO_TOKEN` secret

3. **Supabase Connection Error**
   ```
   Error: Invalid API key
   ```
   **Solution**: Check Supabase URL and key format

### Debug Steps

1. **Check GitHub Actions Logs**
   - Go to Actions tab in GitHub
   - Click on failed workflow
   - Review error messages

2. **Verify Environment Variables**
   ```bash
   # Local testing
   npm run setup-env
   npm start
   ```

3. **Test Supabase Connection**
   - Check Supabase dashboard
   - Verify API settings
   - Test with curl or Postman

## Performance Optimization

### Build Optimization
- Use production builds for releases
- Enable code splitting
- Optimize bundle size

### Runtime Optimization
- Implement proper caching
- Use lazy loading
- Monitor performance metrics

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security alerts
- Monitor app performance
- Backup Supabase data

### Version Management
- Use semantic versioning
- Tag releases in Git
- Maintain changelog
- Document breaking changes
