'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/lib/actions';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [role, setRole] = useState<'student' | 'lab_admin' | 'hod_admin' | 'principal_admin'>('student');

  return (
    <main className="flex-grow flex items-center justify-center p-6 sm:p-12 w-full">
      <div className="max-w-md w-full">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Nexus</h1>
          <p className="text-on-surface-variant font-bold tracking-[0.2em] uppercase text-xs">Clearance Portal</p>
        </div>
        
        {/* Login Card */}
        <div className="aether-card rounded-2xl p-8 sm:p-10">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight text-center">System Login</h2>
            
            {/* Role Toggle */}
            <div className="bg-slate-50 p-1.5 rounded-xl flex flex-col gap-1 mb-6">
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${role === 'student' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-slate-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">school</span> Student
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('lab_admin')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${role === 'lab_admin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-slate-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">science</span> Lab Admin
                </button>
              </div>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => setRole('hod_admin')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${role === 'hod_admin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-slate-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">badge</span> HOD Admin
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('principal_admin')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${role === 'principal_admin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-slate-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">account_balance</span> Principal
                </button>
              </div>
            </div>

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="role" value={role} />

              {state?.error && (
                <div className="p-3 bg-rose-50 text-error font-medium rounded-lg text-sm text-center">
                  {state.error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Institutional Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">alternate_email</span>
                  </div>
                  <input name="email" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="name@nexus.edu" type="email"/>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Access Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                  </div>
                  <input name="password" required className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-on-surface focus:border-primary focus:ring-0 outline-none transition-all" placeholder="••••••••" type="password"/>
                </div>
              </div>

              {/* Submit Button */}
              <button disabled={isPending} className="w-full py-3 px-6 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70" type="submit">
                {isPending ? 'Authenticating...' : 'Login'}
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer Meta */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-on-surface-variant font-medium">
            New to the protocol? <Link href="/register" className="text-primary font-bold hover:underline">Enroll for Clearance</Link>
          </p>
          <p className="text-xs text-on-surface-variant font-medium opacity-60">
            © 2024 Institutional Registrar Services. 
            <span className="mx-2">|</span>
            <a className="hover:text-primary transition-colors" href="#">Compliance Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}
