import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application, User } from '@/lib/models';
import { redirect } from 'next/navigation';
import AdminTable from './AdminTable';

export default async function AdminPortal() {
  const session = await getSession();
  
  if (!session || !session.role.endsWith('admin')) {
    redirect('/login');
  }

  // Determine which column to filter based on role
  let stageColumn = '';
  if (session.role === 'lab_admin') stageColumn = 'lab_status';
  else if (session.role === 'hod_admin') stageColumn = 'hod_status';
  else if (session.role === 'principal_admin') stageColumn = 'principal_status';

  await dbConnect();
  // Find applications that are pending at this admin's specific stage
  // AND all previous stages must be approved.
  let query: any = { overall_status: { $ne: 'rejected' } };
  if (session.role === 'lab_admin') {
    query.lab_status = 'pending';
  } else if (session.role === 'hod_admin') {
    query.lab_status = 'approved';
    query.hod_status = 'pending';
    if ((session as any).branch) {
      const branchStudentIds = await User.find({ role: 'student', branch: (session as any).branch }).distinct('_id');
      query.student_id = { $in: branchStudentIds };
    }
  } else if (session.role === 'principal_admin') {
    query.lab_status = 'approved';
    query.hod_status = 'approved';
    query.principal_status = 'pending';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let approvedQuery: any = {
    reviewed_at: { $gte: today },
  };

  let rejectedQuery: any = {
    reviewed_at: { $gte: today },
  };

  if (session.role === "lab_admin") {
    approvedQuery.lab_status = "approved";
    rejectedQuery.lab_status = "rejected";
  }

  if (session.role === "hod_admin") {
    approvedQuery.hod_status = "approved";
    rejectedQuery.hod_status = "rejected";
  }

  if (session.role === "principal_admin") {
    approvedQuery.principal_status = "approved";
    rejectedQuery.principal_status = "rejected";
  }

  const [
    pendingCount,
    approvedToday,
    rejectedToday,
  ] = await Promise.all([
    Application.countDocuments(query),
    Application.countDocuments(approvedQuery),
    Application.countDocuments(rejectedQuery),
  ]);
  const reviewedToday = approvedToday + rejectedToday;

  const applicationsDoc = await Application.find(query)
    .populate('student_id')
    .sort({ submitted_at: 1 })
    .lean() as any[];

  const pendingApplications = applicationsDoc.map(app => ({
    ...app,
    id: app._id.toString(),
    student_name: app.student_id?.name || 'N/A',
    student_email: app.student_id?.email || 'N/A'
  }));

  return (
    <>
      {/* Administrative Control Header */}
      <section className="mb-5 border-b border-slate-200 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Administrative Protocol
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
              {(session.role.replace('_admin', ''))} Review Terminal
            </h2>
            <p className="text-slate-500 text-sm mt-1">Authorized Access: {session.name}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-1 py-3 text-center min-w-[110px]">
              <span className="material-symbols-outlined text-amber-600 text-xl">
                pending_actions
              </span>

              <p className="text-3xl font-black text-amber-700">
                {pendingCount}
              </p>

              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Pending
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-1 py-3 text-center min-w-[110px]">
              <span className="material-symbols-outlined text-emerald-600 text-xl">
                verified
              </span>

              <p className="text-3xl font-black text-emerald-700">
                {approvedToday}
              </p>

              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Approved Today
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-1 py-3 text-center min-w-[110px]">
              <span className="material-symbols-outlined text-rose-600 text-xl">
                cancel
              </span>

              <p className="text-3xl font-black text-rose-700">
                {rejectedToday}
              </p>

              <p className="text-xs font-bold uppercase tracking-widest text-rose-600">
                Rejected Today
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-1 py-3 text-center min-w-[110px]">
              <span className="material-symbols-outlined text-blue-600 text-xl">
                description
              </span>

              <p className="text-3xl font-black text-blue-700">
                {reviewedToday}
              </p>

              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Total
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="aether-card rounded-3xl !bg-primary/5 p-7 shadow-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">list_alt</span>
          Pending Applications
        </h3>
        <p className="text-sm text-slate-500">
        Review student applications assigned to your approval stage.
        Applications are processed in submission order.
        </p>
        <AdminTable applications={pendingApplications} adminRole={session.role} />
      </div>
    </>
  );
}
