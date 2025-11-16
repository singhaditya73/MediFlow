# Quick Setup Guide

## 1. Install PostgreSQL

### Windows:
Download from: https://www.postgresql.org/download/windows/

Or use Docker:
```bash
docker run --name mediflow-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mediflow -p 5432:5432 -d postgres
```

## 2. Create .env file

```bash
# Copy example
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mediflow?schema=public"
OPENAI_API_KEY="your-openai-api-key"
```

## 3. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name wallet_auth

# Or if migration exists, just push
npx prisma db push
```

## 4. Start the App

```bash
npm run dev
```

## Troubleshooting

### Database connection error?
- Make sure PostgreSQL is running
- Check port 5432 is not blocked
- Verify credentials in .env file

### Docker option (easiest):
```bash
# Start PostgreSQL
docker run --name mediflow-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mediflow -p 5432:5432 -d postgres

# Stop
docker stop mediflow-postgres

# Start again
docker start mediflow-postgres
```
