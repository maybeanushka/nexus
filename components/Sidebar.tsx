"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user.role.endsWith('admin');
  const navClass = (href: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname.startsWith(href)
        ? "bg-primary text-white shadow-md font-semibold"
        : "text-on-surface-variant hover:text-primary hover:bg-slate-100 font-medium"
    }`;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant flex flex-col gap-2 p-6 z-40">
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-black tracking-tight text-primary">NEXUS</h1>
        <p className="mt-1 text-sm text-slate-500">Graduation Clearance Portal</p>
      </div>
      <nav className="flex flex-col gap-1 flex-grow">

        {isAdmin ? (
          <>
            <Link href="/admin-portal" className={navClass("/admin-portal")}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <span>Admin Portal</span>
            </Link>
            <Link href="/admin/library" className={navClass("/admin/library")}>
              <span className="material-symbols-outlined text-[22px]">library_books</span>
              <span>Library Admin</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/student-dashboard" className={navClass("/student-dashboard")}>
              <span className="material-symbols-outlined text-[25px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/submit-application" className={navClass("/submit-application")}>
              <span className="material-symbols-outlined text-[25px]">description</span>
              <span>Apply for Clearance</span>
            </Link>
            <Link href="/library" className={navClass("/library")}>
              <span className="material-symbols-outlined text-[25px]">local_library</span>
              <span>Library</span>
            </Link>
            <Link href="/fees" className={navClass("/fees")}>
              <span className="material-symbols-outlined text-[25px]">payments</span>
              <span>Payments</span>
            </Link>
            <Link href="/certificate" className={navClass("/certificate")}>
              <span className="material-symbols-outlined text-[25px]">verified_user</span>
              <span>Clearance Certificate</span>
            </Link>
            <Link href="/profile" className={navClass("/profile")}>
              <span className="material-symbols-outlined text-[25px]">person</span>
              <span>Student Profile</span>
            </Link>
          </>
        )}

      </nav>
      <div className="mt-auto border-t border-outline pt-6">
        <div className="px-4 mb-1">
          <p className="text-xs font-semibold text-slate-500">Need Help?</p>
          <a
            href="mailto:support@nexus.edu"
            className="mt-1 block text-sm text-primary hover:underline">
            support@nexus.edu
          </a>
          <p className="mt-1 text-xs text-slate-400">
            Nexus v1.0
          </p>
        </div>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 rounded-xl hover:bg-red-50  hover:text-red-500 transition">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
