import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application, DocumentModel } from '@/lib/models';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from './ReviewForm';
import DownloadZipButton from './DownloadZipButton';

export default async function ReviewApplicationPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  if (!session || !session.role.endsWith('admin')) {
    redirect('/login');
  }

  const { id } = await params;

  await dbConnect();
  const app = await Application.findById(id).populate('student_id').lean() as any;

  if (!app) {
    redirect('/admin-portal');
  }

  const documents = await DocumentModel.find({ application_id: id }).lean() as any[];

  return (
    <>
      <section className="mb-10 border-b border-slate-200 pb-8">
        <Link href="/admin-portal" className="text-primary hover:underline font-bold text-xs uppercase tracking-widest mb-4 inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Return to Terminal
        </Link>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Verification Protocol</h2>
        <p className="text-slate-500 text-sm">Reviewing application for: <span className="font-bold text-slate-900">{app.student_id?.name || 'Unknown Student'}</span> ({app.student_id?.email || 'N/A'})</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aether-card rounded-2xl p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Protocol Evidence
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400 mb-2">Protocol Stage</div>
              <div className="status-badge bg-indigo-50 text-primary">
                {session.role.replace('_admin', '').toUpperCase()} REVIEW
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400 mb-3">Supporting Documentation</div>
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <a key={doc._id.toString()} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/20">
                      <span className="material-symbols-outlined text-primary">description</span>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-bold text-slate-900 block">{doc.doc_type.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Click to inspect document</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[20px]">open_in_new</span>
                  </a>
                ))}
              </div>
              <DownloadZipButton documents={documents} studentName={app.student_id?.name || 'Student'} />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400">Timestamp</div>
              <div className="text-sm font-bold text-slate-700 mt-1">{new Date(app.submitted_at).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="aether-card rounded-2xl p-8 border-t-4 border-t-primary">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">gavel</span>
            Administrative Decision
          </h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">Please verify the uploaded documents above before rendering a decision. Once submitted, the protocol will advance to the next authority.</p>
          <ReviewForm applicationId={app._id.toString()} currentNotes="" />
        </div>
      </div>
    </>
  );
}
