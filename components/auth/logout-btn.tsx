'use client';

import { logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

export default function LogoutBtn() {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} >
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}