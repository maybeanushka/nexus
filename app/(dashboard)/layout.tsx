import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import dbConnect from "@/lib/db";
import { Notification } from "@/lib/models";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  await dbConnect();
  const notifications = await Notification.find({
    user_id: session?.userId,
  })
    .sort({ created_at: -1 })
    .limit(5)
    .lean();
  const unreadCount = await Notification.countDocuments({
    user_id: session.userId,
    read: false,
  });
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      <Sidebar user={session} />
      <TopNav user={session} notifications={JSON.parse(JSON.stringify(notifications))} unreadCount={unreadCount} />
      <main id="dashboard-content" className="ml-64 pt-22 px-10 pb-8 min-h-screen">
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-outline-variant flex justify-around items-center px-4 z-50">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
        <span className="material-symbols-outlined text-on-surface-variant">description</span>
      </nav>
    </div>
  );
}
