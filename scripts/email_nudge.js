const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.NEXUS_EMAIL;
const EMAIL_PASS = process.env.NEXUS_PASSWORD;
const APP_URL = process.env.NEXUS_APP_URL || 'http://localhost:3000';
const STALE_THRESHOLD_HOURS = 1;
const NUDGE_COOLDOWN_HOURS = 5;

if (!MONGODB_URI) {
  console.error('\nNEXUS NUDGE: MONGODB_URI is not configured.');
  console.error('Open .env.local and set MONGODB_URI.\n');
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('\nNEXUS NUDGE: Email is not configured.');
  console.error('Open .env.local and set NEXUS_EMAIL and NEXUS_PASSWORD.\n');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  branch: String
});

const ApplicationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overall_status: String,
  lab_status: String,
  hod_status: String,
  principal_status: String,
  last_nudge_at: Date,
  submitted_at: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  action: String,
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

async function runNudge() {
  console.log('Starting Automated Email Nudge Protocol...');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const pendingApps = await Application.find({ overall_status: 'pending' }).populate('student_id');
    console.log(`Found ${pendingApps.length} pending applications.`);

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
            console.log(`Cooldown: Application ${app._id} was already nudged recently (${hoursSinceLastNudge.toFixed(1)}h ago). Skipping.`);
            continue;
          }
        }

        console.log(`Application ${app._id} is stale (${hoursElapsed.toFixed(1)}h) at ${currentStage} stage.`);

        const adminQuery = { role: targetRole };
        if (targetBranch) adminQuery.branch = targetBranch;

        const admins = await User.find(adminQuery);

        if (admins.length > 0) {
          await Application.findByIdAndUpdate(app._id, { last_nudge_at: new Date() });
        }

        for (const admin of admins) {
          console.log(`Nudging ${admin.name} (${admin.email}) for student ${app.student_id.name}...`);

          const mailOptions = {
            from: `"Nexus Protocol" <${EMAIL_USER}>`,
            to: admin.email,
            subject: `URGENT: Pending Clearance Action Required - ${app.student_id.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; color: #1e293b;">
                <h2 style="color: #4f46e5; margin-bottom: 24px; font-weight: 800; letter-spacing: -0.025em;">Nexus Protocol Reminder</h2>
                <p>Dear <strong>${admin.name}</strong>,</p>
                <p>This is an automated institutional nudge regarding a pending clearance application that has exceeded the expected processing time.</p>

                <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Student Identity</p>
                  <p style="margin: 4px 0 16px 0; font-weight: 700; font-size: 18px;">${app.student_id.name}</p>

                  <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Current Protocol Stage</p>
                  <p style="margin: 4px 0 0 0; font-weight: 700;">${currentStage}</p>
                </div>

                <p>Please review and process this application at your earliest convenience to maintain institutional throughput.</p>

                <a href="${APP_URL}/admin-portal" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 24px;">Open Review Desk</a>

                <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                  This is an automated system message. Please do not reply directly to this email.
                </p>
              </div>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${admin.email}`);
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
    console.log('Nudge Protocol Cycle Complete.');
  }
}

runNudge();
