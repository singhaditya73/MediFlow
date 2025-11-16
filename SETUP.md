# MediFlow - Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials (optional for OAuth login)

## Installation Steps

### 1. Clone and Install Dependencies
```bash
cd website
npm install
```

### 2. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE mediflow;
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mediflow?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="sk-your-openai-api-key"
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Database Migration

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env` as `OPENAI_API_KEY`
4. Ensure you have GPT-4 access enabled

## Database Management

### View Database in Prisma Studio
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name migration_name
```

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
Make sure to set all environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Heroku: Config Vars
- AWS/Azure: Application Settings

### Database for Production
Consider using managed PostgreSQL services:
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
- [Railway](https://railway.app/)
- [Heroku Postgres](https://www.heroku.com/postgres)

## Testing the Backend

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","name":"Test User"}'
```

### Test File Upload (requires authentication)
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -F "file=@/path/to/medical-report.pdf"
```

### Test Text Conversion (requires authentication)
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"text":"Patient: John Doe, Age: 45, Diagnosis: Type 2 Diabetes"}'
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Migration Errors
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### OpenAI API Errors
- Verify API key is valid
- Check OpenAI account has credits
- Ensure GPT-4 access is enabled

### NextAuth Errors
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Verify Google OAuth credentials

## Next Steps

1. Configure IPFS for decentralized storage
2. Deploy smart contracts for blockchain access control
3. Set up production database
4. Configure CDN for static assets
5. Set up monitoring and logging

## Support

For issues and questions:
- Check `API_DOCUMENTATION.md` for API details
- Review Prisma schema in `prisma/schema.prisma`
- Check application logs in development console

## License

MIT License - See LICENSE file for details
