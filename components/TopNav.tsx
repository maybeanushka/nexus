'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav({ user }: { user: any }) {
  const pathname = usePathname();
  const titles: Record<string, string> = {
    '/student-dashboard': 'Dashboard',
    '/submit-application': 'Apply for Clearance',
    '/library': 'Library',
    '/fees': 'Payments',
    '/certificate': 'Clearance Certificate',
    '/profile': 'Student Profile',
    '/admin-portal': 'Admin Portal',
    '/admin/library': 'Library Admin',
  };
  const pageTitle = titles[pathname] || 'Nexus';
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md z-30 border-b border-outline-variant/50 flex justify-between items-center px-8">
      <div className="flex flex-col">
        <p className="text-xs font-medium text-primary uppercase tracking-wider">
          Home
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-700">{pageTitle}</span>
        </p>

        <p className="text-sm text-primary mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <div className="flex items-center gap-6">

        <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-outline-variant hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface leading-tight">{user.name}</p>
            <div className="text-right">
              <p className="text-xs text-slate-500">{user.branch}</p>
              <p className="text-[11px] text-slate-400">{user.reg_no}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border border-outline-variant bg-indigo-100 overflow-hidden flex items-center justify-center">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold">{user.name.charAt(0)}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
