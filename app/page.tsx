'use client';

import LogoutBtn from '@/components/auth/logout-btn';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import NewWorkspaceDialog from '@/components/workspace/new-workspace-dialog';
import WorkspaceCard from '@/components/workspace/workspace-card';
import { useAuth } from '@/lib/useAuth';
import { getUserWorkspaces } from '@/lib/workspaces';
import { useEffect, useState } from 'react';
import { Loader2, LayoutGrid } from 'lucide-react';

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
        const result = await getUserWorkspaces(user.uid);
        setWorkspaces(result);
      } catch (err) {
        console.error('Error loading workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user]);

  // Listen for rename events from other parts of the app (sidebar dialog)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ slug: string; name: string }>;
      const { slug, name } = ev.detail || {};
      if (!slug) return;
      setWorkspaces((prev) => prev.map((ws) => (ws.slug === slug ? { ...ws, name } : ws)));
    };

    window.addEventListener('workspace:renamed', handler as EventListener);
    return () => window.removeEventListener('workspace:renamed', handler as EventListener);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Health Stock & Billing</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {workspaces.length > 0 && <NewWorkspaceDialog />}
              <LogoutBtn />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading workspaces...</p>
            </div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="w-8 h-8 text-muted-foreground" />
              </div>
              <Empty>
                <EmptyHeader>
                  <EmptyTitle className="text-2xl font-semibold">Welcome to Health Stock & Billing</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground text-lg mt-2">
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((w) => (
                <WorkspaceCard
                  key={w.slug}
                  name={w.name}
                  slug={w.slug}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}