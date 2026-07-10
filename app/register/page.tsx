'use client';

import { useActionState, useState } from 'react';
import { registerAction } from '@/lib/actions';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);  

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
            <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight text-center">Create Account</h2>
        

            <form action={formAction} className="space-y-5">
              {state?.error && (
                <div className="p-3 bg-rose-50 text-error font-medium rounded-lg text-sm text-center">
                  {state.error}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 mb-4">
                <span className="material-symbols-outlined text-sm text-emerald-600">
                  verified_user
                </span>
                <span className="text-xs font-medium text-emerald-700">
                  Secure institutional authentication
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">Full Legal Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                  </div>
                  <input name="name" required className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-on-surface shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:shadow-md outline-none" placeholder="John Doe" type="text"/>
                </div>
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

              <div className="space-y-2 mb-8">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-1">
                  Academic Branch
                </label>

                <div className="relative group">
                  {/* Left Icon */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">
                      account_tree
                    </span>
                  </div>

                  <select
                    name="branch"
                    required
                    defaultValue=""
                    className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-on-surface shadow-sm transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-md outline-none"
                  >
                    <option value="" disabled>&#160;Select Branch
                    </option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Electrical">Electrical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                  </select>

                  {/* Right Arrow */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button disabled={isPending} className="w-full py-3.5 px-6 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70" type="submit">
                {isPending ? 'Creating account...' : 'Register'}
                <span className="material-symbols-outlined text-lg">person_add</span>
              </button>

              {/* Footer Meta */}
              <div className="mt-2 space-y-1 text-center">
                <p className="text-sm text-slate-500">
                  Already registered?
                  <Link
                    href="/login"
                    className="ml-1 font-semibold text-primary hover:underline"
                  >
                    Return to login
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
