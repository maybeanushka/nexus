'use client';

import { useActionState } from 'react';
import { registerAction } from '@/lib/actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <main className="flex-grow flex items-center justify-center p-6 sm:p-12 w-full">
      <div className="max-w-md w-full">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Nexus</h1>
          <p className="text-on-surface-variant font-bold tracking-[0.2em] uppercase text-xs">Registry Enrollment</p>
        </div>

        {/* Register Card */}
        <div className="aether-card rounded-2xl p-8 sm:p-10">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight text-center">Create Account</h2>

            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 bg-rose-50 text-error font-medium rounded-lg text-sm text-center">
                  {state.error}
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Full Legal Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                  </div>
                  <input name="name" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="John Doe" type="text" />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Institutional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">alternate_email</span>
                  </div>
                  <input name="email" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="name@nexus.edu" type="email" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Secure Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                  </div>
                  <input name="password" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="••••••••" type="password" />
                </div>
              </div>

              {/* Branch Selection */}
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Academic Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">account_tree</span>
                  </div>
                  <select name="branch" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all appearance-none">
                    <option value="">Select Branch</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Electrical">Electrical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button disabled={isPending} className="w-full mt-4 py-3 px-6 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70" type="submit">
                {isPending ? 'Enrolling...' : 'Enroll in Nexus'}
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            Already registered? <Link href="/login" className="text-primary font-bold hover:underline">Return to Login</Link>
          </p>
          <p className="text-xs text-on-surface-variant">
            © 2024 Nexus Automated Clearance System.
          </p>
        </div>
      </div>
    </main>
  );
}
