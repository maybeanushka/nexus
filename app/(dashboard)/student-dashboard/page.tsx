import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application, Transaction, AuditLog, DocumentModel } from '@/lib/models';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PaymentButton from './PaymentButton';
import DownloadDocsButton from './DownloadDocsButton';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  // Get latest application
  const application = await Application.findOne({ student_id: session.userId }).sort({ submitted_at: -1 }).lean() as any;

  // Get Audit Logs
  let auditLogs: any[] = [];
  if (application) {
    auditLogs = await AuditLog.find({ application_id: application._id })
      .populate('actor_id')
      .sort({ created_at: -1 })
      .lean() as any[];
  }

  // Get Documents
  let documents: any[] = [];
  if (application) {
    documents = await DocumentModel.find({ application_id: application._id }).lean() as any[];
  }

  // Get Transaction
  const transaction = await Transaction.findOne({ student_id: session.userId }).sort({ created_at: -1 }).lean() as any;

  // Calculate Metrics
  const queueCount = await Application.countDocuments({ overall_status: 'pending' });
  const queueSize = { count: queueCount };
  const expectedCompletionMins = queueSize.count * 15;

  // Calculate Completion Percentage
  let completionPercentage = 0;
  if (application) {
    completionPercentage += 20; // Documents Submission (Automatic if app exists)
    if (application.lab_status === 'approved') completionPercentage += 20;
    if (application.hod_status === 'approved') completionPercentage += 20;
    if (application.principal_status === 'approved') completionPercentage += 20;
    if (transaction && transaction.status === 'success') completionPercentage += 20;
  }


  return (
    <>
    {/* Welcome Hero Section */}
    <section className="mb-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-primary uppercase tracking-widest">
          Student Dashboard
        </p>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
          Welcome back, {session.name} 👋
        </h1>
        <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
          Track your graduation clearance, monitor approvals,
          manage payments and download your clearance certificate
          from one place.
        </p>
      </div>
      {!application ? (
        <Link
          href="/submit-application"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-semibold shadow-xl hover:scale-[1.02] transition">
          <span className="material-symbols-outlined">
            add_circle
          </span>
          Apply Now →
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-4">
        </div>
      )}
    </section>
    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
      <span className="material-symbols-outlined text-3xl text-blue-600">description</span>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Application</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{application ? "Submitted" : "Not Started"}</h3>
      </div>

      <div className="rounded-2xl border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <span className="material-symbols-outlined text-3xl text-emerald-600">monitoring</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Progress</p>
          <h3 className="mt-2 text-2xl font-bold text-slade-900">{completionPercentage}%</h3>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
          <span className="material-symbols-outlined text-3xl text-amber-600">payments</span>
          <p className="text-xs uppercase font-semibold tracking-widest text-amber-500">Payments</p>
          <h3 className="mt-2 text-2xl font-bold text-slade-900">{transaction ? "Paid" : "Pending"}</h3>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6 shadow-sm">
          <span className="material-symbols-outlined text-3xl text-violet-600">workspace_premium</span>
          <p className="text-xs uppercase font-semibold tracking-widest text-violet-500">Certificate</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{application?.overall_status === "approved" ? "Available" : "Locked"}</h3>
      </div>
    </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Status Tracker Heatmap */}
        <div className="col-span-12 lg:col-span-8 aether-card rounded-2xl !bg-primary p-7 text-white shadow-xl">
          <div className="flex justify-between bg-primary items-center mb-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              Application Status
            </h3>
            <div className="flex items-center gap-4">
              {application && <DownloadDocsButton documents={documents} studentName={session.name} />}
              {application && (
                <span className={`status-badge ${application.overall_status === 'approved' ? 'bg-teal-50 text-teal-700' : application.overall_status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-primary'}`}>
                  {application.overall_status.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {application ? (
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 px-4 py-8 bg-slate-50/50 rounded-3xl border border-slate-100">
              {[
                { id: 'docs', label: 'Documents Submission', status: 'approved', icon: 'cloud_done' },
                { id: 'lab', label: 'Laboratory In-charge', status: application.lab_status, icon: 'verified' },
                { id: 'hod', label: 'Head of Department', status: application.hod_status, icon: 'verified' },
                { id: 'principal', label: 'Principal Office', status: application.principal_status, icon: 'verified' }
              ].map((stage, idx, arr) => (
                <div key={stage.id} className="relative z-10 flex flex-col items-center group w-full max-w-[160px]">
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-xl transition-all duration-500 border-4 border-white
                    ${stage.status === 'approved' ? 'bg-teal-500 text-white scale-110 shadow-sm shadow-teal-200 mb-3' : 
                      stage.status === 'rejected' ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-200 mb-3' : 
                      'bg-amber-400 text-white shadow-sm shadow-amber-100 mb-3'}
                  `}>
                    <span className="material-symbols-outlined text-2xl md:text-3xl">
                      {stage.status === 'approved' ? (stage.icon || 'verified') : stage.status === 'rejected' ? 'error' : 'hourglass_bottom'}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stage.status === 'pending' ? 'text-amber-700' : 'text-slate-900'}`}>
                      {stage.label}
                    </p>
                    <div className={`
                      inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                      ${stage.status === 'approved' ? 'bg-teal-50 border-teal-100 text-teal-600' : 
                        stage.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                        'bg-amber-50 border-amber-200 text-amber-700'}
                    `}>
                      {stage.status}
                    </div>
                  </div>

                  {idx < arr.length - 1 && (
                    <div className="absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 hidden md:block">
                      <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white/80 p-8 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-primary">description</span>

              <h3 className="mt-5 text-3xl font-bold text-slate-900">
                Start Your Clearance Journey
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
                Submit your documents once and track every approval from your laboratory, department and principal's office in one place.
              </p>

              <div className="mx-auto mt-8 grid max-w-md gap-4 text-left">
                <div className="flex items-center gap-3 text-primary">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Upload required documents
                </div>

                <div className="flex items-center gap-3 text-primary">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Department verification
                </div>

                <div className="flex items-center gap-3 text-primary">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Pay pending dues
                </div>

                <div className="flex items-center gap-3 text-primary">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Download digital certificate
                </div>
              </div>

              <Link
                href="/submit-application"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Start Application
              </Link>
            </div>
          )}

          {application && application.overall_status === 'rejected' && (
            <div className="mt-8 pt-8 border-t border-rose-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                    <span className="material-symbols-outlined text-2xl">priority_high</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-rose-900 leading-tight">Documents Revision Required</h4>
                    <p className="text-sm text-rose-700 mt-1 max-w-md">Your application was rejected at a specific stage. Review the remarks below, update your documents, and resubmit to resume the process from the checkpoint.</p>
                  </div>
                </div>
                <Link href="/submit-application" className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm shadow-rose-200 transition-all shrink-0">
                  Update & Resubmit
                </Link>
              </div>
            </div>
          )}

          {application && application.overall_status === 'approved' && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Final Clearance & Settlement</h4>
                <p className="text-sm text-slate-600 mb-6">Your clearance is approved. Please pay the processing fee to generate your certificate.</p>

                {!transaction ? (
                  <PaymentButton />
                ) : (
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-teal-600">check</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Payment Processed</p>
                        <p className="text-xs text-slate-500">TXN: {transaction.qr_data}</p>
                      </div>
                    </div>
                    <Link href="/certificate" className="text-sm font-bold text-primary hover:underline">View Certificate</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        <div className="col-span-12 lg:col-span-4 aether-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            Latest Updates
          </h3>
          <div
            className={`space-y-6 relative ${
              auditLogs.length > 0
                ? "before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent"
                : ""
            }`}>
                {auditLogs.length > 0 ? (
              auditLogs.map((log: any, index: number) => (
                <div key={log._id.toString()} className="relative flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10 ${log.action.includes('rejected') ? 'bg-rose-100 text-rose-600' :
                    log.action.includes('approved') ? 'bg-teal-100 text-teal-600' :
                      'bg-indigo-100 text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {log.action.includes('rejected') ? 'close' : log.action.includes('approved') ? 'check' : 'cloud_upload'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {log.action === 'submitted' ? 'Application Submitted' : 
                       log.action === 'resubmitted' ? 'Application Resubmitted' :
                       `${(log.actor_id?.role || '').replace('_admin', '').toUpperCase()} Admin ${log.action.includes('approved') ? 'Approved' : 'Rejected'}`}
                    </p>
                    {log.remarks && (
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">{log.remarks}</p>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-wider">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-on-surface-variant relative z-10 pl-10">No updates logged yet.<br></br>Latest activities will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
