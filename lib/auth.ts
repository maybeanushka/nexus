import { cookies } from 'next/headers';
import dbConnect from './db';
import { Session, User } from './models';
import crypto from 'crypto';

export async function createSession(userId: string) {
  await dbConnect();
  const sessionId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    _id: sessionId,
    user_id: userId,
    expires_at: expiresAt
  });

  const cookieStore = await cookies();
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function getSession() {
  await dbConnect();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) return null;

  const sessionDoc = await Session.findOne({ 
    _id: sessionId, 
    expires_at: { $gt: new Date() } 
  }).lean();

  if (!sessionDoc) return null;

  const user = await User.findById(sessionDoc.user_id).lean() as any;
  if (!user) return null;

  return {
    ...sessionDoc,
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    dob: user.dob,
    phone: user.phone,
    profile_picture: user.profile_picture,
    reg_no: user.reg_no,
    batch: user.batch,
    branch: user.branch
  };
}

export async function destroySession() {
  await dbConnect();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  
  cookieStore.delete('session');
}
