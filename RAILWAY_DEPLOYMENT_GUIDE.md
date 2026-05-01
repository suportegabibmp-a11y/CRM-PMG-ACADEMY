# Railway Deployment Guide

## Prerequisites
- Railway account
- GitHub repository connected to Railway

## Environment Variables Required

### Server Environment Variables
Set these in Railway dashboard under Settings > Variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=8080

# CORS
FRONTEND_URL=https://your-app-name.railway.app
NODE_ENV=production
```

### Client Environment Variables
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Steps

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Connect your GitHub repository
   - Select the `CRM-PMG-ACADEMY` repository

2. **Configure Environment Variables**
   - Add all required environment variables listed above
   - Make sure to set `NODE_ENV=production`

3. **Deploy Settings**
   - Railway will automatically detect the Node.js application
   - The `railway.toml` file will configure the build process
   - Build command: `npm install && npm run build`
   - Start command: `cd server && npm start`

4. **Database Setup**
   - Add PostgreSQL service in Railway
   - Copy the DATABASE_URL to your environment variables
   - Run database migrations: `npx prisma migrate deploy`

5. **Build Process**
   - Railway will build the client application
   - Build the server TypeScript code
   - Generate Prisma client
   - Start the server

## Troubleshooting

### Build Issues
- Ensure all dependencies are in package.json
- Check that Node.js version is compatible (>=18.0.0)
- Verify environment variables are set correctly

### Database Issues
- Verify DATABASE_URL is correct
- Run `npx prisma generate` if needed
- Check database migrations are applied

### Runtime Issues
- Check server logs in Railway dashboard
- Verify PORT is set to 8080
- Ensure CORS allows your frontend URL

## Post-Deployment
1. Test the application at your Railway URL
2. Verify database connections
3. Test authentication flows
4. Monitor logs for any errors
