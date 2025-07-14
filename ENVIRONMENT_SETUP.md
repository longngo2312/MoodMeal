# Environment Variables Setup

This document explains how to configure environment variables for the MoodMeal app both locally and in GitHub Actions.

## Local Development Setup

### 1. Create Environment File

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### 2. Configure Supabase Variables

Edit the `.env` file with your Supabase project details:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

## GitHub Actions Setup

### 1. Repository Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIs...` |
| `EXPO_TOKEN` | Expo access token (for publishing) | `abc123...` |

### 2. Get Expo Token (Optional)

Only needed if you want to publish to Expo:

1. Install Expo CLI: `npm install -g @expo/cli`
2. Login: `expo login`
3. Generate token: `expo whoami --json` or create one in Expo dashboard
4. Add the token as `EXPO_TOKEN` secret in GitHub

## Environment Variable Usage

### In Code

Environment variables are automatically available in your app:

```typescript
// src/services/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

### Important Notes

1. **Prefix**: All public environment variables must start with `EXPO_PUBLIC_`
2. **Security**: Never commit `.env` files to version control
3. **Build Time**: Environment variables are embedded at build time
4. **Client Side**: `EXPO_PUBLIC_` variables are available in client-side code

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

### Test Job
- Runs TypeScript checks
- Creates `.env` file from secrets
- Builds the app for testing

### Build Preview Job
- Runs on pull requests
- Creates preview builds
- Uses environment variables from secrets

### Deploy Job
- Runs on main branch pushes
- Publishes to Expo (if `EXPO_TOKEN` is configured)
- Uses production environment variables

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing Supabase environment variables
   ```
   **Solution**: Ensure `.env` file exists and contains the required variables

2. **Build Fails in GitHub Actions**
   ```
   Error: EXPO_PUBLIC_SUPABASE_URL is not defined
   ```
   **Solution**: Check that repository secrets are properly configured

3. **Expo Publish Fails**
   ```
   Error: Not logged in
   ```
   **Solution**: Add `EXPO_TOKEN` secret to repository

### Verification

To verify your setup:

1. **Local**: Run `npm start` - should not show environment variable errors
2. **GitHub**: Check Actions tab for successful builds
3. **Expo**: Check your Expo dashboard for published updates

## Security Best Practices

1. **Never commit** `.env` files
2. **Use different** Supabase projects for development/production
3. **Rotate keys** regularly
4. **Limit permissions** on Supabase API keys
5. **Monitor usage** in Supabase dashboard

## Example Workflow

1. **Development**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   npm start
   ```

2. **Production**:
   ```bash
   git push origin main
   # GitHub Actions automatically builds and deploys
   ```

3. **Pull Request**:
   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   # Create PR - GitHub Actions runs tests and builds preview
   ```
