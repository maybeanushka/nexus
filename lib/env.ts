function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export const env = {
  MONGODB_URI: requireEnv('MONGODB_URI'),
  NEXUS_APP_URL: optionalEnv('NEXUS_APP_URL') || 'http://localhost:3000',
  FORMSPREE_ID: optionalEnv('FORMSPREE_ID'),
  AWS_ACCESS_KEY_ID: optionalEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optionalEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: optionalEnv('AWS_REGION') || 'us-east-1',
  AWS_BUCKET_NAME: optionalEnv('AWS_BUCKET_NAME'),
};
