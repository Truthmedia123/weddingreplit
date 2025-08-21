# Setting up .env file with Supabase

## Step 1: Get your Supabase details

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → Database**
3. **Copy the Connection string (URI)** from "Pooled" section
4. **Navigate to Settings → API**
5. **Copy the Project URL and anon public key**

## Step 2: Create .env file

Create a file named `.env` in your project root with this content:

```bash
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Supabase Project Details
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Environment
NODE_ENV=development
```

## Step 3: Replace the placeholders

Replace the following with your actual values:
- `[YOUR-PROJECT-REF]` - Your Supabase project reference
- `[YOUR-PASSWORD]` - Your database password
- `[YOUR-ANON-KEY]` - Your anon public key
- `[YOUR-SERVICE-ROLE-KEY]` - Your service role key

## Step 4: Test the connection

After creating the .env file, run:
```bash
npm run db:merge:status
```

This will check if your Supabase connection is working.

## Step 5: Migrate data

Once connected, run:
```bash
npm run db:migrate-postgres
```

This will migrate all your SQLite data to Supabase PostgreSQL.
