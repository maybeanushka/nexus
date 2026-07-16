const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_URL = process.env.NEXUS_APP_URL;
const STALE_THRESHOLD_HOURS = 24;
const NUDGE_COOLDOWN_HOURS = 24;

if (!MONGODB_URI) {
  console.error('\nNEXUS NUDGE: MONGODB_URI is not configured.');
  console.error('Open .env.local and set MONGODB_URI.\n');
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('\nNEXUS NUDGE: Email is not configured.');
  console.error('Open .env.local and set EMAIL_USER and EMAIL_PASS.\n');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  role: String,
  branch: String
});

const ApplicationSchema = new mongoose.Schema({
  _id: String,
  student_id: {
    type: String,
    ref: 'User'
  },
  lab_status: String,
  hod_status: String,
  principal_status: String,
  overall_status: String,
  last_nudge_at: Date,
  submitted_at: Date,
  reviewed_at: Date
});

const AuditLogSchema = new mongoose.Schema({
  application_id: {
    type: String,
    ref: "Application",
  },
  action: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function runNudge() {

  try {
    await mongoose.connect(MONGODB_URI);

    const pendingApps = await Application.find({ overall_status: 'pending' }).populate('student_id');

    for (const app of pendingApps) {
      let currentStage = '';
      let targetRole = '';
      let targetBranch = null;

      if (app.lab_status === 'pending') {
        currentStage = 'Laboratory Approval';
        targetRole = 'lab_admin';
      } else if (app.hod_status === 'pending') {
        currentStage = 'HOD Approval';
        targetRole = 'hod_admin';
        targetBranch = app.student_id.branch;
      } else if (app.principal_status === 'pending') {
        currentStage = 'Principal Office Approval';
        targetRole = 'principal_admin';
      }

      if (!currentStage) continue;

      const lastLog = await AuditLog.findOne({ application_id: app._id }).sort({ created_at: -1 });
      const lastUpdateTime = lastLog ? lastLog.created_at : app.submitted_at;
      const hoursElapsed = (new Date() - new Date(lastUpdateTime)) / (1000 * 60 * 60);

      if (hoursElapsed >= STALE_THRESHOLD_HOURS) {
        if (app.last_nudge_at) {
          const hoursSinceLastNudge = (new Date() - new Date(app.last_nudge_at)) / (1000 * 60 * 60);
          if (hoursSinceLastNudge < NUDGE_COOLDOWN_HOURS) {
            continue;
          }
        }

        const adminQuery = { role: targetRole };
        if (targetBranch) adminQuery.branch = targetBranch;

        const admins = await User.find(adminQuery);

        if (admins.length > 0) {
          await Application.findByIdAndUpdate(app._id, { last_nudge_at: new Date() });
        }

        for (const admin of admins) {

          const mailOptions = {
            from: `"Nexus Clearance Portal" <${EMAIL_USER}>`,
            to: admin.email,
            subject: `Reminder: Clearance Application Pending Review`,
            html: `
            <div style="background:#f3f4f6;padding:40px 0;">
            <div style="max-width:650px;margin:auto;background:white;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,.08);">

            <div style="background:#4f46e5;padding:28px;text-align:center;">
            <h1 style="margin:0;color:white;">Nexus Clearance Portal</h1>
            <p style="margin-top:8px;color:#ddd;">
            Administrative Reminder
            </p>
            </div>

            <div style="padding:30px;">

            <p>Hello <strong>${admin.name}</strong>,</p>

            <p>
            A student's clearance application has been awaiting your review for longer than the expected processing time.
            </p>

            <div style="background:#eef2ff;padding:18px;border-left:4px solid #4f46e5;margin:25px 0;">
            <strong>Student</strong><br>
            ${app.student_id.name}
            </div>

            <div style="background:#eef2ff;padding:18px;border-left:4px solid #4f46e5;margin:25px 0;">
            <strong>Pending Stage</strong><br>
            ${currentStage}
            </div>

            <div style="text-align:center;margin-top:30px;">
            <a
            href="${APP_URL}/admin-portal"
            style="
            background:#4f46e5;
            color:white;
            padding:14px 30px;
            text-decoration:none;
            border-radius:10px;
            font-weight:bold;
            display:inline-block;
            ">
            Open Review Dashboard
            </a>
            </div>

            </div>

            <div style="background:#f8fafc;padding:20px;text-align:center;font-size:13px;color:#64748b;border-top:1px solid #e5e7eb;">
            This is an automated reminder from the Nexus Clearance Portal.
            Please do not reply.
            </div>

            </div>
            </div>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
          } catch (err) {
            console.error(`Failed to send email to ${admin.email}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Nudge System Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runNudge();
