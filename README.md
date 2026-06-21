# Nexus Clearance Portal

Nexus is a Next.js application for student clearance workflows. It supports student registration, document submission, staged administrative review, library dues, payment receipts, clearance certificates, and public certificate verification.

## Requirements

- Node.js 20+
- npm
- MongoDB connection string

## Environment Setup

Create `.env.local` in the project root:

```bash
MONGODB_URI=mongodb+srv://user:password@example.mongodb.net/nexus?retryWrites=true&w=majority
```

Optional integrations:

```bash
FORMSPREE_ID=your-formspree-form-id

NEXUS_EMAIL=your-email@example.com
NEXUS_PASSWORD=your-email-app-password

AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name
```

If AWS settings are omitted, uploads fall back to `public/uploads`.

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

## Public Registration

Public registration creates student accounts only. Admin roles are intentionally not available on the registration page.

## Create Admin Accounts

Admin accounts are created from the command line with an interactive seed script:

```bash
npm run seed:admin
```

The script prompts for:

- Name
- Email
- Password
- Role
- Branch, only when the role is `hod_admin`

Valid admin roles:

```bash
lab_admin
hod_admin
principal_admin
```

Valid branches for HOD admins:

```bash
CS
IT
Mechanical
Electrical
Civil
```

If the email already exists, the script prints a clear error, does not overwrite the existing account, disconnects from MongoDB, and exits safely.

## Background Nudge Script

Run the nudge worker:

```bash
npm run nudge
```

The nudge script requires email settings in `.env.local`:

```bash
NEXUS_EMAIL=
NEXUS_PASSWORD=
```

## Security Notes

- Never commit `.env.local` or real credentials.
- Rotate any credential that has ever been committed or shared.
- Create admin accounts only through the seed script or a future protected admin workflow.
