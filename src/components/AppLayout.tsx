'use client';
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '@/context/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  role?: 'owner' | 'manager' | 'staff' | 'customer';
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const { currentRole, language } = useApp();

  return (
    <div
      className="flex min-h-screen bg-background overflow-x-hidden w-full"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Sidebar currentPath={currentPath} role={currentRole} />
      <main className="flex-1 min-w-0 overflow-auto flex flex-col">
        <Header />
        <div className="flex-grow">{children}</div>
      </main>
    </div>
  );
}
