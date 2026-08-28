import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  role?: 'owner' | 'manager' | 'staff' | 'customer';
}

export default function AppLayout({ children, currentPath, role = 'staff' }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath={currentPath} role={role} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}