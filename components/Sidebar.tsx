"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user.role.endsWith('admin');
  const navClass = (href: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname.startsWith(href)
        ? "bg-white text-primary shadow-lg font-semibold"
        : "text-white/80 hover:text-white hover:bg-white/10 font-medium"
    }`;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-primary border-r border-white/20 border-outline-variant flex flex-col gap-2 p-6 z-40">
      <div className="mb-8 px-2">
        <Image
          src="/nexusnewlogo.png"
          alt="Nexus"
          width={120}
          height={40}
          priority
        />

        <p className="mt-3 text-sm text-white/80">
          Graduation Clearance Portal
        </p>
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
              <span >Dashboard</span>
            </Link>
            <Link href="/submit-application" className={navClass("/submit-application")}>
              <span className="material-symbols-outlined text-[25px]">description</span>
              <span >Apply for Clearance</span>
            </Link>
            <Link href="/library" className={navClass("/library")}>
              <span className="material-symbols-outlined text-[25px]">local_library</span>
              <span >Library</span>
            </Link>
            <Link href="/fees" className={navClass("/fees")}>
              <span className="material-symbols-outlined text-[25px]">payments</span>
              <span >Payments</span>
            </Link>
            <Link href="/certificate" className={navClass("/certificate")}>
              <span className="material-symbols-outlined text-[25px]">verified_user</span>
              <span >Clearance Certificate</span>
            </Link>
            <Link href="/profile" className={navClass("/profile")}>
              <span className="material-symbols-outlined text-[25px]">person</span>
              <span >Student Profile</span>
            </Link>
          </>
        )}

      </nav>
      <div className="border-t border-outline pt-2">
        <div className="px-4">
          <p className="text-xs font-semibold text-white/80">Need Help?</p>
          <a
            href="mailto:support@nexus.edu"
            className="block text-sm text-white hover:underline">
            support@nexus.edu
          </a>
          <p className="text-xs text-white/80 mb-1">
            Nexus v1.0
          </p>
        </div>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center text-white/80 gap-3 px-4 py-3 rounded-xl hover:bg-red-50  hover:text-red-500 transition">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
