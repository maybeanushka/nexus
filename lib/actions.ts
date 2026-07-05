'use server';

import dbConnect from './db';
import { getSession } from "./auth";
import { User, Application, DocumentModel, Due, Transaction, AuditLog } from './models';
import bcrypt from 'bcryptjs';
import { createSession, destroySession } from './auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { uploadToS3 } from './s3';
import mongoose from 'mongoose';
import { env } from './env';

export async function loginAction(prevState: any, formData: FormData) {
  await dbConnect();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const user = await User.findOne({ email }).lean() as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Invalid credentials' };
  }

  if (role && user.role !== role) {
    return { error: `Account exists but is not registered as ${role}` };
  }

  await createSession(user._id.toString());
  
  if (user.role.endsWith('admin')) {
    redirect('/admin-portal');
  } else {
    redirect('/student-dashboard');
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  await dbConnect();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = 'student';
  const branch = formData.get('branch') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { error: 'Email already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    _id: crypto.randomUUID(),
    name,
    email,
    password: hashedPassword,
    role,
    branch
  });

  await createSession(user._id.toString());

  redirect('/student-dashboard');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

export async function submitApplication(prevState: any, formData: FormData) {
  await dbConnect();
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in." };
  }
  if (session.role !== "student") {
    return { error: "Only students can submit applications." };
  }
  const studentId = session.userId;
  const isResubmission = formData.get('isResubmission') === 'true';
  
  const idCard = formData.get('idCard') as File;
  const libraryReceipt = formData.get('libraryReceipt') as File;
  const labRecords = formData.get('labRecords') as File;

  const existing = await Application.findOne({ student_id: studentId }).sort({ submitted_at: -1 }).lean() as any;
  
  if (existing && existing.overall_status === 'approved') {
    return { error: 'Clearance already obtained' };
  }

  try {
    let idUrl = '';
    let libUrl = '';
    let labUrl = '';

    if (existing) {
      const docs = await DocumentModel.find({ application_id: existing._id }).lean();
      idUrl = docs.find(d => d.doc_type === 'id_card')?.file_url || '';
      libUrl = docs.find(d => d.doc_type === 'library_receipt')?.file_url || '';
      labUrl = docs.find(d => d.doc_type === 'lab_records')?.file_url || '';
    }

    if (idCard && idCard.size > 0) idUrl = await uploadToS3(idCard, 'id_cards');
    if (libraryReceipt && libraryReceipt.size > 0) libUrl = await uploadToS3(libraryReceipt, 'library_receipts');
    if (labRecords && labRecords.size > 0) labUrl = await uploadToS3(labRecords, 'lab_records');

    if (!idUrl || !libUrl || !labUrl) return { error: 'All documents are required' };

    if (!isResubmission && existing && existing.overall_status === 'pending') {
      return { error: 'You already have a pending application. Please wait for review.' };
    }

    if (isResubmission && existing) {
      const updateData: any = {
        overall_status: 'pending',
        submitted_at: new Date()
      };
      if (existing.lab_status === 'rejected') updateData.lab_status = 'pending';
      if (existing.hod_status === 'rejected') updateData.hod_status = 'pending';
      if (existing.principal_status === 'rejected') updateData.principal_status = 'pending';

      await Application.findByIdAndUpdate(existing._id, updateData);
      
      await DocumentModel.updateOne({ application_id: existing._id, doc_type: 'id_card' }, { file_url: idUrl });
      await DocumentModel.updateOne({ application_id: existing._id, doc_type: 'library_receipt' }, { file_url: libUrl });
      await DocumentModel.updateOne({ application_id: existing._id, doc_type: 'lab_records' }, { file_url: labUrl });

      await AuditLog.create({
        application_id: existing._id,
        action: 'resubmitted',
        remarks: 'Student updated documents and resubmitted for review.'
      });
    } else {
      const appId = crypto.randomUUID();
      const app = await Application.create({
        _id: appId,
        student_id: studentId,
        lab_status: 'pending',
        hod_status: 'pending',
        principal_status: 'pending',
        overall_status: 'pending'
      });

      await DocumentModel.insertMany([
        { _id: crypto.randomUUID(), application_id: appId, doc_type: 'id_card', file_url: idUrl },
        { _id: crypto.randomUUID(), application_id: appId, doc_type: 'library_receipt', file_url: libUrl },
        { _id: crypto.randomUUID(), application_id: appId, doc_type: 'lab_records', file_url: labUrl }
      ]);

      await AuditLog.create({
        _id: crypto.randomUUID(),
        application_id: appId,
        action: 'submitted',
        remarks: 'Student submitted documents for clearance.'
      });
    }

  } catch (e: any) {
    console.error("Submission error:", e);
    return { error: e.message || 'Failed to process application. Please try again.' };
  }

  redirect('/student-dashboard');
}

async function sendStudentNotification(studentEmail: string, studentName: string, stage: string, status: string, notes: string = '') {
  if (!env.FORMSPREE_ID) {
    console.warn('FORMSPREE_ID is not configured. Skipping student notification.');
    return;
  }

  try {
    await fetch(`https://formspree.io/f/${env.FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: `Official Update: Clearance Protocol ${status.toUpperCase()} - ${stage}`,
        recipient: studentName,
        message: `Dear ${studentName},\n\nThis is an official update regarding your institutional clearance protocol. Your application has been ${status.toUpperCase()} by the ${stage}.\n\n${notes ? `Administrative Remarks: ${notes}\n\n` : ''}Please log in to your Nexus Dashboard to view the next steps or proceed with the settlement.\n\nInstitutional Registrar Services\nNexus Clearance Portal`,
        student_email: studentEmail
      })
    });
  } catch (e) {
    console.error("Failed to notify student:", e);
  }
}

export async function reviewApplication(applicationId: string, status: 'approved' | 'rejected', notes: string) {
  await dbConnect();
  const session = await getSession();

  if (!session) {
    throw new Error("You must be logged in.");
  }
  if (
    !["lab_admin", "hod_admin", "principal_admin"].includes(session.role)
  ) {
    throw new Error("Unauthorized");
  }
  const adminId = session.userId;
  const adminRole = session.role;
  let stageColumn = '';
  let stageName = '';
  
  if (adminRole === 'lab_admin') { stageColumn = 'lab_status'; stageName = 'Laboratory In-charge'; }
  else if (adminRole === 'hod_admin') { stageColumn = 'hod_status'; stageName = 'Head of Department'; }
  else if (adminRole === 'principal_admin') { stageColumn = 'principal_status'; stageName = 'Office of the Principal'; }
  else throw new Error("Invalid admin role");

  const appData = await Application.findById(applicationId).populate('student_id').lean() as any;
  if (!appData) throw new Error("Application not found");

  let overallStatus = 'pending';
  if (status === 'rejected') {
    overallStatus = 'rejected';
  } else if (adminRole === 'principal_admin' && status === 'approved') {
    overallStatus = 'approved';
  } else {
    overallStatus = appData.overall_status || 'pending';
  }

  await Application.findByIdAndUpdate(applicationId, {
    [stageColumn]: status,
    overall_status: overallStatus,
    reviewed_at: new Date()
  });

  await AuditLog.create({
    _id: crypto.randomUUID(),
    application_id: applicationId,
    actor_id: adminId,
    action: `${adminRole}_${status}`,
    remarks: notes || ''
  });

  // Send notification to student
  await sendStudentNotification(appData.student_id.email, appData.student_id.name, stageName, status, notes);

  return true;
}

export async function processFakePayment() {
  await dbConnect();
  const session = await getSession();

  if (!session) {
    return { error: "You must be logged in." };
  }
  if (session.role !== "student") {
    return { error: "Unauthorized" };
  }

  const studentId = session.userId;
  const transId = crypto.randomUUID();
  const qrData = `PAY-${transId.substring(0, 8).toUpperCase()}`;
  
  // 1. Record the Transaction
  await Transaction.create({
    _id: transId,
    student_id: studentId,
    amount: 50.00,
    qr_data: qrData,
    status: 'success'
  });

  // 2. Automatically clear all pending dues
  await Due.updateMany({ student_id: studentId, status: 'pending' }, { status: 'paid' });

  // 3. Log automated advancement
  const app = await Application.findOne({ student_id: studentId, overall_status: 'pending' });
  if (app) {
    await AuditLog.create({
      _id: crypto.randomUUID(),
      application_id: app._id,
      action: 'payment_cleared',
      remarks: 'Automated: Financial clearance obtained via digital settlement. Pipeline advanced to review.'
    });
  }

  revalidatePath('/student-dashboard');
  revalidatePath('/fees');
  revalidatePath('/library');
  return { success: true, qrData, transactionId: transId };
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  await dbConnect();
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in." };
  }
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const dob = formData.get('dob') as string;
  const profilePicture = formData.get('profilePicture') as File;

  if (!email || !phone || !dob) {
    return { error: 'Email, Phone, and DOB are required' };
  }

  try {
    let picUrl = '';
    if (profilePicture && profilePicture.size > 0) {
      if (!profilePicture.type.startsWith("image/")) {
        return { error: "Only image files are allowed." };
      }
      picUrl = await uploadToS3(profilePicture, "profiles");
    }

    const updateData: any = { email, phone, dob };
    if (picUrl) updateData.profile_picture = picUrl;

    await User.findByIdAndUpdate(session.userId, updateData);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error("Profile update error:", e);
    return { error: 'Failed to update profile.' };
  }
}

export async function reconcileLibraryDues(csvData: string) {
  await dbConnect();
  const session = await getSession();
  if (!session) {
    throw new Error("You must be logged in.");
  }
  if (
    !["lab_admin", "hod_admin", "principal_admin"].includes(session.role)
  ) {
    throw new Error("Unauthorized");
  }
  const lines = csvData.trim().split('\n');
  const results: any[] = [];
  
  for (const line of lines) {
    const [studentId, pendingBooks, fineAmount] = line.split(',').map(s => s.trim());
    if (!studentId || isNaN(Number(fineAmount))) continue;

    const fine = Number(fineAmount);
    const books = Number(pendingBooks);

    await Due.create({
      _id: crypto.randomUUID(),
      student_id: studentId,
      type: 'library',
      amount: fine,
      details: `Pending Books: ${books}`,
      status: fine > 0 || books > 0 ? 'pending' : 'paid'
    });
    
    results.push({ studentId, fine, books });
  }

  return results;
}

export async function payDuesAction(dueId: string) {
  await dbConnect();
  const session = await getSession();

  if (!session) {
    return { error: "You must be logged in." };
  }
  if (session.role !== "student") {
    return { error: "Unauthorized" };
  }

  const studentId = session.userId;
  const due = await Due.findById(dueId).lean() as any;
  if (!due || due.status === 'paid') return { error: 'Due already paid or not found' };

  const transId = crypto.randomUUID();
  const qrData = `RECEIPT-${transId.substring(0, 8).toUpperCase()}`;

  const trans = await Transaction.create({
    _id: transId,
    student_id: studentId,
    amount: due.amount,
    qr_data: qrData
  });

  await Due.findByIdAndUpdate(dueId, { status: 'paid', transaction_id: transId });

  return { success: true, transactionId: trans._id.toString() };
}

export async function bulkApprove(applicationIds: string[]) {
  await dbConnect();
  const session = await getSession();

  if (!session) {
    throw new Error("You must be logged in.");
  }
  if (
    !["lab_admin", "hod_admin", "principal_admin"].includes(session.role)
  ) {
    throw new Error("Unauthorized");
  }

  const adminId = session.userId;
  const adminRole = session.role;
  const stageName = adminRole === 'lab_admin' ? 'Laboratory In-charge' : adminRole === 'hod_admin' ? 'Head of Department' : 'Office of the Principal';
  
  for (const id of applicationIds) {
    const app = await Application.findById(id).lean() as any;
    if (!app) continue;
    
    const pendingDues = await Due.findOne({ student_id: app.student_id, status: 'pending' }).lean();
    if (pendingDues) {
      throw new Error(`Cannot approve application ${id.substring(0, 8)}: Student has pending financial dues.`);
    }
  }

  const appsToNotify = await Application.find({ _id: { $in: applicationIds } }).populate('student_id').lean() as any[];

  for (const id of applicationIds) {
    let stageColumn = adminRole === 'lab_admin' ? 'lab_status' : adminRole === 'hod_admin' ? 'hod_status' : 'principal_status';
    
    let overallStatus = 'pending';
    if (adminRole === 'principal_admin') overallStatus = 'approved';
    else {
      const currentApp = await Application.findById(id).lean() as any;
      overallStatus = currentApp?.overall_status || 'pending';
    }

    await Application.findByIdAndUpdate(id, {
      [stageColumn]: 'approved',
      overall_status: overallStatus,
      reviewed_at: new Date()
    });

    await AuditLog.create({
      _id: crypto.randomUUID(),
      application_id: id,
      actor_id: adminId,
      action: `${adminRole}_approved`,
      remarks: 'Bulk Approved'
    });
  }

  for (const app of appsToNotify) {
    await sendStudentNotification(app.student_id.email, app.student_id.name, stageName, 'approved');
  }

  return true;
}
