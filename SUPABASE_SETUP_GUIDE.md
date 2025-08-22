# 🚀 Supabase Setup Guide for Local Development

## Quick Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a project name (e.g., "goan-wedding")
4. Set a database password (save this!)
5. Choose a region (preferably close to you)

### 2. Get Your Supabase Credentials
1. Go to **Settings → API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

3. Go to **Settings → Database**
4. Copy the **Connection string (URI)** from the "Pooled" section

### 3. Create Environment File
Create a `.env` file in your project root with:

```env
# Supabase Configuration
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Development Settings
NODE_ENV=development
PORT=5002
FRONTEND_URL=http://localhost:3000
DOMAIN_URL=http://localhost:5002

# API Keys (for local development)
API_KEY="local-dev-api-key"
REQUEST_SECRET_KEY="local-dev-secret-key"

# Site Configuration
SITE_URL=http://localhost:5002
SITE_NAME="The Goan Wedding"
```

### 4. Run Database Migrations
```bash
npm run db:migrate
```

### 5. Seed the Database
```bash
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

## Example .env File
Replace the placeholders with your actual Supabase values:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0NzIwMCwiZXhwIjoxOTUyMTIzMjAwfQ.example"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ3MjAwLCJleHAiOjE5NTIxMjMyMDB9.example"
NODE_ENV=development
PORT=5002
```

## Troubleshooting

### Database Connection Issues
- Make sure your `.env` file is in the project root
- Verify your Supabase credentials are correct
- Check that your IP is allowed in Supabase (Settings → Database → Connection pooling)

### Migration Issues
- Run `npm run db:reset` to reset the database
- Check the migration files in `migrations/` folder

### Port Issues
- Change the PORT in `.env` if 5002 is already in use
- Make sure no other services are running on the same port

## Next Steps
Once Supabase is set up:
1. Your app will have a real database
2. All features will work properly
3. You can deploy to production with the same database
4. Data will persist between development sessions

## Support
If you encounter issues:
1. Check the Supabase dashboard for connection status
2. Verify your environment variables
3. Check the server logs for specific error messages
