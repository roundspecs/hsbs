'use client';

import AuthPage from '@/components/auth/AuthPage';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/useAuth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );

  if (!user) return <AuthPage />;

  return <>{children}</>;
}