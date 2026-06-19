# Nexus Clearance Portal

Nexus is a Next.js application for student clearance workflows. It includes student registration and login, document submission, staged administrative review, library dues, payment receipts, certificate generation, and certificate verification.

## Requirements

- Node.js 20+
- npm
- MongoDB connection string

## Environment Setup

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Then fill in the required values.

### Required Variables

```bash
MONGODB_URI=mongodb+srv://user:password@example.mongodb.net/nexus?retryWrites=true&w=majority
```

### Optional Variables

```bash
NEXUS_APP_URL=http://localhost:3000

NEXUS_EMAIL=your-email@example.com
NEXUS_PASSWORD=your-email-app-password

FORMSPREE_ID=your-formspree-form-id

AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name
```

If AWS variables are not configured, uploads fall back to local storage under `public/uploads`.

If `FORMSPREE_ID` is not configured, Formspree-based notifications are skipped.

`NEXUS_EMAIL` and `NEXUS_PASSWORD` are required only when running the email nudge script.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Background Nudge Script

The nudge script loads values from `.env.local`.

```bash
npm run nudge
```

Required for this script:

```bash
MONGODB_URI=
NEXUS_EMAIL=
NEXUS_PASSWORD=
```

## Security Notes

- Never commit `.env.local` or any real credentials.
- Rotate any credential that has ever been committed or shared.
- Use `.env.example` only for placeholder values.
- Configure production environment variables in the deployment platform, not in source code.
