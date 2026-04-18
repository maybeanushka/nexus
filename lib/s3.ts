import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;
  
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function uploadToS3(file: File, folder: string): Promise<string> {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided to uploadToS3");
  }

  const client = getS3Client();
  const fileExtension = file.name.split('.').pop() || 'dat';
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;
  
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (e) {
    console.error("Failed to read file buffer:", e);
    throw new Error("Could not read document data. The file might be corrupted or too large.");
  }

  // Fallback to local storage if S3 is not configured
  if (!client || !process.env.AWS_BUCKET_NAME) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const localFileName = `${crypto.randomUUID()}.${fileExtension}`;
      const localPath = path.join(uploadDir, localFileName);
      fs.writeFileSync(localPath, buffer);
      
      return `/uploads/${folder}/${localFileName}`;
    } catch (e) {
      console.error("Local upload failed:", e);
      throw new Error("Internal server error: Failed to save documents to local storage.");
    }
  }

  // S3 Upload
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
  } catch (e) {
    console.error("S3 upload failed:", e);
    throw new Error("Cloud storage error: Failed to upload documents to the secure vault.");
  }
}
