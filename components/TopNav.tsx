import Link from 'next/link';

export default function TopNav({ user }: { user: any }) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md z-30 border-b border-outline-variant/50 flex justify-between items-center px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black tracking-tighter text-primary">Dashboard</h1>
        <div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
        <span className="text-on-surface-variant font-medium text-sm">Graduation Clearance Portal</span>
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
