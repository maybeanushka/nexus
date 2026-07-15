'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { markNotificationsRead } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function TopNav({
  user,
  notifications,
  unreadCount,
}: {
  user: any;
  notifications: any[];
  unreadCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
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
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md z-30 border-b border-black/10 flex justify-between items-center px-8">
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
      <div ref={dropdownRef} className="flex items-center gap-6 relative">
        <button
          onClick={async () => {
            const opening = !showNotifications;
            setShowNotifications(opening);

            if (opening && unreadCount > 0) {
              await fetch("/api/notifications/read", {
                method: "POST",
              });

              router.refresh();
          }}}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <span className="material-symbols-outlined text-slate-700">
            notifications
          </span>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-14 w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-50">

            <div className="px-5 py-4 border-b">
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto">

              {notifications.length === 0 ? (
                <div className="px-5 py-6 text-center text-slate-500">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-6 text-center text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <div
                        key={notification._id}
                        className={`px-5 py-4 border-b last:border-b-0 hover:bg-slate-50 ${
                          notification.read ? "" : "bg-indigo-50"
                        }`}
                      >
                        <p className="font-semibold text-sm">
                          {notification.title}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {notification.message}
                        </p>

                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    className={`px-5 py-4 border-b last:border-b-0 hover:bg-slate-50 ${
                      notification.read ? "" : "bg-indigo-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {notification.title}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

            </div>

          </div>
        )}
        <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-outline-variant hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface leading-tight">{user.name}</p>
            <div className="text-right">
              <p className="text-xs text-slate-500">{user.branch}</p>
              <p className="text-[11px] text-slate-500">{user.reg_no}</p>
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
