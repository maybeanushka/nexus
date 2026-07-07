import Link from 'next/link';

export default function Sidebar({ user }: { user: any }) {
  const isAdmin = user.role.endsWith('admin');

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant flex flex-col gap-2 p-6 z-40">
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-black tracking-tight text-primary">NEXUS</h1>
        <p className="mt-1 text-sm text-slate-500">Graduation Clearance Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">

        {isAdmin ? (
          <>
            <Link href="/admin-portal" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-95">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <span>Admin Portal</span>
            </Link>
            <Link href="/admin/library" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">library_books</span>
              <span>Library Admin</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/student-dashboard" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-95">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/submit-application" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">description</span>
              <span>Apply for Clearance</span>
            </Link>
            <Link href="/library" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">local_library</span>
              <span>Library</span>
            </Link>
            <Link href="/fees" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">payments</span>
              <span>Payments</span>
            </Link>
            <Link href="/certificate" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
              <span>Clearance Certificate</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-slate-100 transition-all duration-200 rounded-xl font-medium">
              <span className="material-symbols-outlined text-[22px]">person</span>
              <span>Student Profile</span>
            </Link>
          </>
        )}

      </nav>
      <div className="mt-auto pt-6 flex flex-col gap-1 border-t border-outline-variant">
        <form action="/api/logout" method="POST" className="w-full">
          <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
