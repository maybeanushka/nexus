'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/lib/actions';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [role, setRole] = useState<'student' | 'lab_admin' | 'hod_admin' | 'principal_admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const roleInfo = {
    student: {
      title: 'Student Portal',
      description: 'Submit and track your graduation clearance application.'
    },
    lab_admin: {
      title: 'Laboratory Administrator',
      description: 'Review laboratory records and approve pending requests.'
    },
    hod_admin: {
      title: 'Head of Department',
      description: 'Verify departmental clearance before final approval.'
    },
    principal_admin: {
      title: 'Principal',
      description: 'Issue the final graduation clearance certificate.'
    }
  };
  

  return (
    <main className="h-dvh overflow-hidden grid lg:grid-cols-2">

      {/* Left Branding Panel */}
      <section className="hidden lg:flex flex-col justify-between bg-primary text-white p-16 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/5"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5"></div>
        <div className="absolute top-24 right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10">
          <Image
            src="/nexusnewlogo.png"
            alt="Nexus"
            width={120}
            height={40}
            priority
          />

          <p className="mt-3 uppercase tracking-[0.3em] text-sm text-indigo-100 mx-2">
            Graduation Clearance Portal
          </p>

          <h1 className="mt-9 text-5xl font-black leading-tight max-w-130">
            One portal for your complete graduation clearance.
          </h1>

          <p className="mt-6 text-indigo-100 text-lg leading-relaxed max-w-md">
            A centralized platform for students to submit documents,
            track approvals, resolve departmental dues, and obtain
            their final clearance certificate.
          </p>

          <div className="mt-12 space-y-5">

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-300">
                check_circle
              </span>
              <span>Online clearance workflow</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-300">
                check_circle
              </span>
              <span>Track approvals in real time</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-300">
                check_circle
              </span>
              <span>Download digital clearance certificate</span>
            </div>

          </div>
        </div>
      </section>

      {/* Right Login Section */}
      <section className="flex items-start justify-center bg-slate-50 px-8 pt-8 pb-4">
        <div className="max-w-md w-full">
        
        {/* Login Card */}
        <div className="aether-card rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight text-center">System Login</h2>
            
            {/* Role Toggle */}
            <div className="bg-slate-50 p-1 rounded-xl flex flex-col gap-1 mb-4">
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${role === 'student' ? 'bg-white text-primary shadow-md ring-2 ring-primary/20' : 'text-slate-500 hover:bg-white hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-sm">school</span> Student
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('lab_admin')}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${role === 'lab_admin' ? 'bg-white text-primary shadow-md ring-2 ring-primary/20' : 'text-slate-500 hover:bg-white hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-sm">science</span> Lab Admin
                </button>
              </div>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => setRole('hod_admin')}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${role === 'hod_admin' ? 'bg-white text-primary shadow-md ring-2 ring-primary/20' : 'text-slate-500 hover:bg-white hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-sm">badge</span> HOD Admin
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('principal_admin')}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${role === 'principal_admin' ? 'bg-white text-primary shadow-md ring-2 ring-primary/20' : 'text-slate-500 hover:bg-white hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-sm">account_balance</span> Principal
                </button>
              </div>
            </div>

            <div key={role} className="mb-5 rounded-xl border border-primary/10 bg-primary/5 p-4 animate-roleFade">
              <p className="font-semibold text-slate-900">
                {roleInfo[role].title}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {roleInfo[role].description}
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="role" value={role} />

              {state?.error && (
                <div className="p-3 bg-rose-50 text-error font-medium rounded-lg text-sm text-center">
                  {state.error}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 mb-2">
                <span className="material-symbols-outlined text-sm text-emerald-600">
                  verified_user
                </span>
                <span className="text-xs font-medium text-emerald-700">
                  Secure institutional authentication
                </span>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Institutional Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                  </div>
                  <input name="email" required className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-on-surface shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:shadow-md outline-none" placeholder="name@nexus.edu" type="email"/>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Access Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                  </div>
                  <input name="password" required className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-on-surface shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:shadow-md outline-none" placeholder="••••••••" type={showPassword ? 'text' : 'password'}/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button disabled={isPending} className="w-full py-3.5 px-6 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70" type="submit">
                {isPending ? 'Signing you in...' : 'Login'}
                <span className="material-symbols-outlined text-lg">login</span>
              </button>

              {/* Footer Meta */}
              <div className="mt-2 space-y-1 text-center">
                <p className="text-sm text-slate-500">
                  New student?
                  <Link
                    href="/register"
                    className="ml-1 font-semibold text-primary hover:underline"
                  >
                    Create your account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      </section>
    </main>
  );
}
