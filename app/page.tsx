'use client';

import LogoutBtn from '@/components/auth/LogoutBtn';
import NewWorkspaceDialog from '@/components/NewWorkspaceDialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import WorkspaceCard from '@/components/WorkspaceCard';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/useAuth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

/**
 * Dashboard/Home page
 * Shows only the workspaces where the user is a member.
 */
export default function Home() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWorkspaces = async () => {
      try {
        const wsSnap = await getDocs(collection(db, 'workspaces'));
        const result: { name: string; slug: string }[] = [];

        // check each workspace’s members subcollection for current user
        for (const wsDoc of wsSnap.docs) {
          const memberRef = doc(db, `workspaces/${wsDoc.id}/members/${user.uid}`);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            const { name, slug } = wsDoc.data() as any;
            result.push({ name, slug });
          }
        }

        setWorkspaces(result);
      } catch (err) {
        console.error('Error loading workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Workspaces</h1>
          </div>
          <div className="flex items-center gap-3">
            {
              workspaces.length != 0 &&
              <NewWorkspaceDialog />
            }
            <LogoutBtn />
          </div>
        </header>

        <section>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 min-h-[200px]">
            {loading ? (
              <p className="text-slate-500">Loading workspaces…</p>
            ) : workspaces.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No workspaces yet</EmptyTitle>
                  <EmptyDescription>
                    You don’t belong to any workspaces yet. Create one to get
                    started.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <NewWorkspaceDialog />
                </EmptyContent>
              </Empty>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspaces.map((w) => (
                  <WorkspaceCard key={w.slug} name={w.name} slug={w.slug} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}