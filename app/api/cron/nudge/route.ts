import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Application, AuditLog, User } from '@/lib/models';

export const runtime = 'nodejs';

/**
 * NEXUS AUTOMATED NUDGE SYSTEM (HIGH FREQUENCY)
 * Frequency: Triggered every 5 minutes (Cron)
 * Logic: Checks for applications pending for more than the Estimated Completion Time (10 minutes for Demo).
 */
export async function GET() {
  await dbConnect();
  
  const pendingApps = await Application.find({ overall_status: 'pending' }).populate('student_id').lean() as any[];

  const delays: any[] = [];
  const now = new Date();

  for (const app of pendingApps) {
    const lastLog = await AuditLog.findOne({ application_id: app._id }).sort({ created_at: -1 }).lean() as any;
    const startTime = lastLog ? new Date(lastLog.created_at) : new Date(app.submitted_at);
    
    const diffMs = now.getTime() - startTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // Threshold: 10 minutes (Estimated Completion Time for Protocol Demo)
    if (diffMinutes > 10) {
      let currentAuthority = '';
      let authorityEmail = '';

      if (app.lab_status === 'pending') {
        currentAuthority = 'Laboratory In-charge';
        authorityEmail = 'lab.registrar@nexus-portal.edu';
      } else if (app.hod_status === 'pending') {
        currentAuthority = 'Head of Department';
        authorityEmail = 'hod.registrar@nexus-portal.edu';
      } else if (app.principal_status === 'pending') {
        currentAuthority = 'Office of the Principal';
        authorityEmail = 'principal.registrar@nexus-portal.edu';
      }

      if (currentAuthority) {
        delays.push({
          appId: app._id.toString(),
          student: app.student_id?.name || 'Unknown',
          authority: currentAuthority,
          email: authorityEmail,
          delayMinutes: Math.round(diffMinutes)
        });
      }
    }
  }

  if (delays.length > 0) {
    const formspreeId = process.env.FORMSPREE_ID || 'mjkgvdyv';
    
    for (const delay of delays) {
      try {
        await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _subject: `PROTOCOL DELAY ALERT: Action Required at ${delay.authority} Stage`,
            recipient: delay.authority,
            message: `Official Institutional Nudge,\n\nThis is a high-priority automated reminder from the Nexus Clearance Portal. The application for ${delay.student} (ID: ${delay.appId}) has exceeded the institutional Estimated Completion Time.\n\nCurrent delay: ${delay.delayMinutes} minutes.\n\nImmediate review is required to maintain the clearance throughput.\n\nInstitutional Registrar Services\nNexus Clearance Portal`,
            admin_email: delay.email
          })
        });
      } catch (e) {
        console.error("Nudge failed for", delay.appId, e);
      }
    }
  }

  return NextResponse.json({ 
    status: 'success', 
    timestamp: now.toISOString(),
    frequency: '5_min',
    nudgesSent: delays.length, 
    details: delays 
  });
}
