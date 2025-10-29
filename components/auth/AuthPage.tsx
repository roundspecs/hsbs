'use client';

import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth';

export default function AuthPage() {
  const handleLogin = async () => {
    await signInWithGoogle();     // from lib/auth.ts
  };

  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <h1 className="text-2xl font-semibold mb-6">
        Health Stock & Billing System
      </h1>

      <Button
        variant='outline'
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
      >
        <img src="/google-icon.svg" alt="Google icon" width={18} />
        Continue with Google
      </Button>
    </main>
  );
}