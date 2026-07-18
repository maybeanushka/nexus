import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application, Transaction } from '@/lib/models';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import PrintButton from '@/components/PrintButton';
import CopyLinkButton from './CopyLinkButton';
import Image from "next/image";

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
      <div className="aether-card rounded-3xl p-12 max-w-3xl mx-auto text-center mt-5">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
          <span className="material-symbols-outlined text-5xl text-amber-600">
            lock
          </span>
        </div>

        <h2 className="mt-6 text-3xl font-black">
          Certificate Locked
        </h2>

        <p className="mt-3 text-slate-500 max-w-lg mx-auto">
          Complete all graduation clearance requirements to unlock your
          official clearance certificate.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 p-6 text-left">

          <h3 className="font-bold mb-5">
            Clearance Checklist
          </h3>

          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <span>Administrative Approval</span>

              {application ? (
                <span className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Approved
                </span>
              ) : (
                <span className="flex items-center gap-2 text-amber-600 font-semibold">
                  <span className="material-symbols-outlined">
                    pending
                  </span>
                  Pending
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span>Clearance Fee</span>

              {transaction ? (
                <span className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Paid
                </span>
              ) : (
                <span className="flex items-center gap-2 text-amber-600 font-semibold">
                  <span className="material-symbols-outlined">
                    pending
                  </span>
                  Pending
                </span>
              )}
            </div>

          </div>

        </div>

        <Link
          href="/student-dashboard"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
        >
          <span className="material-symbols-outlined text-lg">
            dashboard
          </span>
          Return to Dashboard
        </Link>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

        <div>
          <h2 className="text-3xl font-black">
            Official Clearance Certificate
          </h2>

          <p className="text-slate-500 mt-2">
            Digitally issued after successful completion of all institutional clearance requirements.
          </p>
        </div>

        <div className="flex gap-3">

          <PrintButton />
        </div>

      </div>

      <div id="certificate-to-print" className="print-document bg-white border-[14px] border-slate-100 p-10 sm:p-24 rounded-[30px] shadow-2xl relative overflow-hidden text-center" style={{ backgroundImage: "radial-gradient(circle at center, rgba(131, 239, 225, 0.05) 0%, transparent 100%)" }}>
        
        {/* Certificate Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined" style={{ fontSize: '460px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center" >
            <Image
                    src="/nexusdarklogo.png"
                    alt="Nexus"
                    width={110}
                    height={110}
                    priority
                  />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-slate-900 mb-2">Nexus</h1>
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-16">Certificate of Clearance</p>

          <p className="text-lg text-slate-600 mb-4">This is to certify that</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-slate-200 inline-block px-12">{session.name}</h2>
          
          <p className="text-lg text-slate-600  mx-auto leading-relaxed mb-16">
            has successfully completed all required verification stages and is hereby granted full clearance from the institution. This certificate confirms that the student has no outstanding administrative, laboratory, or library obligations and is officially cleared by the institution.
          </p>

          <div className="mt-10 space-y-2">

            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Certificate Number
            </p>

            <p className="font-mono font-bold tracking-wider text-slate-700">
            {application._id.toUpperCase()}
            </p>

           </div>

          <div className="flex justify-between items-end mt-24">
            <div className="text-left">
              <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Date Issued</p>
              <p className="text-sm font-medium mt-1">{new Date(application.reviewed_at ?? new Date()).toLocaleDateString()}</p>
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
