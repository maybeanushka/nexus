'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateProfileAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user }: { user: any }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);
  const [preview, setPreview] = useState(user.profile_picture || null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Picture Card */}
        <div className="md:col-span-1">
          <div className="aether-card rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-inner">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="material-symbols-outlined">photo_camera</span>
                <input type="file" name="profilePicture" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">{user.name}</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary mt-1">Student Identity</p>
          </div>
        </div>

        {/* Data Fields Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="aether-card rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-primary">badge</span>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Registry Details</h3>
            </div>

            {state?.error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-100 text-teal-600 text-sm font-bold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Profile updated successfully.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Registration Number</label>
                <input disabled value={user.reg_no || 'N/A'} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Academic Batch</label>
                <input disabled value={user.batch || 'N/A'} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Academic Branch</label>
                <input disabled value={user.branch || 'N/A'} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Date of Birth</label>
                <input type="date" name="dob" defaultValue={user.dob || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-primary transition-colors outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Phone Number</label>
                <input type="tel" name="phone" defaultValue={user.phone || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-primary transition-colors outline-none" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Official Email Address</label>
                <input type="email" name="email" defaultValue={user.email || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-primary transition-colors outline-none" />
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
              <button disabled={isPending} className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                {isPending ? 'Syncing Profile...' : 'Save Changes'}
                <span className="material-symbols-outlined text-lg">save</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
