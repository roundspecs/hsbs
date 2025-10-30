'use client';

import LogoutBtn from '@/components/auth/LogoutBtn';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import NewWorkspaceDialog from '@/components/workspace/NewWorkspaceDialog';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/useAuth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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

        // check each workspace's members subcollection for current user
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">H</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">Health Stock & Billing</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Manage your workspaces</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {workspaces.length > 0 && <NewWorkspaceDialog />}
              <LogoutBtn />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your workspaces...</p>
            </div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <Empty>
                <EmptyHeader>
                  <EmptyTitle className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Health Stock & Billing</EmptyTitle>
                  <EmptyDescription className="text-slate-600 text-lg leading-relaxed">
                    You don't have any workspaces yet. Create your first workspace to start managing your health stock and billing operations.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-8">
                  <NewWorkspaceDialog />
                </EmptyContent>
              </Empty>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your Workspaces</h2>
              <p className="text-slate-600">Select a workspace to continue working</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {workspaces.map((w) => (
                <WorkspaceCard key={w.slug} name={w.name} slug={w.slug} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}