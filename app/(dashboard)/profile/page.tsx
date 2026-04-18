import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Registry Identity</h2>
        <p className="text-on-surface-variant text-lg">Manage your institutional profile and contact metadata.</p>
      </div>
      
      <ProfileForm user={session} />
    </section>
  );
}
