import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application, Transaction } from '@/lib/models';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import PrintButton from '@/components/PrintButton';
import CopyLinkButton from './CopyLinkButton';

export default async function CertificatePage() {
  const session = await getSession();
  if (!session || session.role !== 'student') redirect('/login');

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  await dbConnect();
  const application = await Application.findOne({ 
    student_id: session.userId, 
    overall_status: 'approved' 
  }).sort({ submitted_at: -1 }).lean() as any;

  const transaction = await Transaction.findOne({ 
    student_id: session.userId, 
    status: 'success' 
  }).sort({ created_at: -1 }).lean() as any;

  if (!application || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 shadow-sm rounded-3xl min-h-[50vh]">
        <span className="material-symbols-outlined text-6xl text-rose-500 mb-4">cancel</span>
        <h4 className="text-2xl font-black text-on-surface mb-2">Certificate Unavailable</h4>
        <p className="text-on-surface-variant text-sm max-w-sm mb-6">
          {!application ? 'Your clearance protocol must be fully approved by the administration.' : 'You must pay the clearance processing fee before a certificate can be generated.'}
        </p>
        <Link href="/student-dashboard" className="text-primary font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">Official Clearance Certificate</h2>
      </div>

      <div id="certificate-to-print" className="bg-white border-8 border-slate-100 p-12 sm:p-24 rounded-[2rem] shadow-xl relative overflow-hidden text-center" style={{ backgroundImage: "radial-gradient(circle at center, rgba(131, 239, 225, 0.05) 0%, transparent 100%)" }}>
        
        {/* Certificate Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined" style={{ fontSize: '400px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-slate-900 mb-2">Nexus Protocol</h1>
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-16">Certificate of Clearance</p>

          <p className="text-lg text-slate-600 mb-4">This is to certify that</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200 inline-block px-12">{session.name}</h2>
          
          <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed mb-16">
            has successfully completed all required verification stages and is hereby granted full clearance from the institution. All dues and protocols have been settled.
          </p>

          <div className="flex justify-between items-end mt-24">
            <div className="text-left">
              <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Date Issued</p>
              <p className="text-sm font-medium mt-1">{new Date(application.reviewed_at || Date.now()).toLocaleDateString()}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">TXN: {transaction.qr_data}</p>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner group transition-all hover:scale-105">
                 <QRCodeSVG 
                   value={`${baseUrl}/verify/${application._id.toString()}`} 
                   size={140} 
                   level="H" 
                   includeMargin={true}
                   className="rounded-lg"
                 />
              </div>
              <div className="mt-4 flex flex-col items-end gap-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Verify Authenticity</p>
                <p className="text-[10px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{application._id.toString().substring(0, 16).toUpperCase()}</p>
                <CopyLinkButton url={`${baseUrl}/verify/${application._id.toString()}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
