'use client';

import AuthPage from '@/app/auth/page';
import { useAuth } from '@/lib/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

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