# Quick PostgreSQL Setup & Migration Guide

## Option 1: Neon PostgreSQL (Recommended - Free)

### Step 1: Create Free PostgreSQL Database
1. Go to https://neon.tech
2. Sign up for free account (no credit card)
3. Create new project
4. Copy the connection string

### Step 2: Set Environment Variable
Create `.env` file in project root:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

### Step 3: Migrate Data
```bash
npm run db:migrate-postgres
```

### Step 4: Restart Application
```bash
npm run dev
```

## Option 2: Local PostgreSQL with Docker

### Step 1: Install Docker Desktop
1. Download from https://docker.com
2. Install and start Docker Desktop

### Step 2: Run PostgreSQL Container
```bash
docker run --name goan-wedding-postgres \
  -e POSTGRES_DB=goan_wedding_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### Step 3: Set Environment Variable
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/goan_wedding_db"
```

### Step 4: Migrate Data
```bash
npm run db:migrate-postgres
```

## Option 3: Manual PostgreSQL Installation

### Step 1: Install PostgreSQL
1. Download from https://postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set

### Step 2: Create Database
```bash
createdb goan_wedding_db
```

### Step 3: Set Environment Variable
```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/goan_wedding_db"
```

### Step 4: Migrate Data
```bash
npm run db:migrate-postgres
```

## What Gets Migrated

✅ **From SQLite to PostgreSQL:**
- 2 vendors
- 43 categories  
- 1 blog post
- All invitation templates (when seeded)
- All table structures and relationships

✅ **New in PostgreSQL:**
- Better performance
- Concurrent connections
- ACID compliance
- Backup capabilities
- Production-ready

## Verification

After migration, check:
```bash
# Check if PostgreSQL is connected
curl http://localhost:5002/health

# Check data in new database
npm run db:seed  # Add invitation templates
```
