'use client';

import AuthPage from '@/components/auth/auth-page';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/useAuth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <Spinner className="size-8 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );

  if (!user) return <AuthPage />;

  return <>{children}</>;
}