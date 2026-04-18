import dbConnect from '@/lib/db';
import { Application, User, Transaction } from '@/lib/models';
import { notFound } from 'next/navigation';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  await dbConnect();

  const application = await Application.findById(id).populate('student_id').lean() as any;
  if (!application || application.overall_status !== 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-rose-100 text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Invalid Certificate</h1>
          <p className="text-slate-500 text-sm">The provided clearance ID does not match any valid institutional records or has been revoked.</p>
          <div className="pt-4 text-[10px] font-mono text-slate-300 uppercase tracking-widest">Verification Failed</div>
        </div>
      </div>
    );
  }

  const transaction = await Transaction.findOne({ student_id: application.student_id._id }).lean() as any;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-teal-100 text-center space-y-6 max-w-md relative overflow-hidden">
        {/* Security Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400"></div>
        
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl">verified</span>
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Authenticity Verified</h1>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-teal-600">Nexus Institutional Protocol</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Student Name</p>
            <p className="font-bold text-slate-900">{application.student_id.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Reg No</p>
              <p className="font-bold text-slate-900 text-sm">{application.student_id.reg_no || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</p>
              <p className="font-bold text-teal-600 text-sm uppercase">Cleared</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Clearance ID</p>
            <p className="font-mono text-[10px] text-slate-500 break-all">{id}</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          This digital certificate is cryptographically linked to the institutional registrar. 
          Verified on {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}
