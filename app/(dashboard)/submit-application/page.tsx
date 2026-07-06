import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import SubmitForm from './SubmitForm';
import dbConnect from '@/lib/db';
import { Application } from '@/lib/models';
import Link from 'next/link';

export default async function SubmitApplicationPage() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') redirect('/login');

    await dbConnect();

    const existing = await Application.findOne({
      student_id: session.userId,
      overall_status: { $ne: 'rejected' }
    }).sort({ submitted_at: -1 }).lean() as any;

    return (
      <section>
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Protocol Initiation</h2>
        </div>
        {existing && existing.overall_status !== 'rejected' ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-12 text-center aether-card rounded-2xl min-h-[50vh]">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">task_alt</span>
            <h4 className="text-2xl font-black text-on-surface mb-2">Application Already Submitted</h4>
            <p className="text-on-surface-variant text-sm max-w-sm mb-6">
              You currently have an active clearance protocol in progress. You cannot submit another application until the current one is either approved or rejected.
            </p>
            <Link href="/student-dashboard" className="text-white bg-primary px-6 py-3 rounded-xl font-bold shadow hover:bg-indigo-700 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <SubmitForm isResubmission={existing?.overall_status === 'rejected'} />
        )}
      </section>
    );
  } catch (e) {
    // Re-throw redirect errors so Next.js can handle them properly
    if (isRedirectError(e)) throw e;
    console.error('SubmitApplicationPage error:', e);
    return (
      <section>
        <div className="aether-card rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-rose-600 mb-4">Unable to load page</h2>
          <p className="text-slate-600">An unexpected error occurred. Please refresh or contact support.</p>
        </div>
      </section>
    );
  }
}
