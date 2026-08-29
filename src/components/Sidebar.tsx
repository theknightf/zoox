'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import {
  LayoutDashboard,
  CalendarClock,
  Monitor,
  Building2,
  Users,
  Clock,
  ShoppingCart,
  Package,
  Gamepad2,
  Wrench,
  PackageSearch,
  MessageSquare,
  Star,
  UserCog,
  BarChart3,
  Settings,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  MapPin,
  Wallet,
  Receipt,
  ArrowDownCircle,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
 section?: string;
}

const staffNav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} />, section: 'main' },
  { label: 'Live Sessions', href: '/live-sessions', icon: <Monitor size={18} />, badge: 2, section: 'main' },
  { label: 'Reservations', href: '/reservations', icon: <CalendarClock size={18} />, badge: 1, section: 'main' },
  { label: 'Customers', href: '/customers', icon: <Users size={18} />, section: 'main' },
  { label: 'My Attendance', href: '/attendance', icon: <MapPin size={18} />, section: 'main' },
  { label: 'Shift Settle', href: '/shift-closing', icon: <ScrollText size={18} />, section: 'main' },
  { label: 'Expenses', href: '/expenses', icon: <Receipt size={18} />, section: 'main' },
  { label: 'Withdrawal Req', href: '/withdrawals', icon: <ArrowDownCircle size={18} />, section: 'main' },
  { label: 'Hardware', href: '/hardware', icon: <Gamepad2 size={18} />, section: 'support' },
  { label: 'Lost & Found', href: '/lost-found', icon: <PackageSearch size={18} />, section: 'support' },
];

const ownerNav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} />, section: 'main' },
  { label: 'Live Sessions', href: '/live-sessions', icon: <Monitor size={18} />, badge: 2, section: 'main' },
  { label: 'Reservations', href: '/reservations', icon: <CalendarClock size={18} />, badge: 1, section: 'main' },
  { label: 'Customers', href: '/customers', icon: <Users size={18} />, section: 'main' },
  
  { label: 'Employees CRM', href: '/employees', icon: <UserCog size={18} />, section: 'operations' },
  { label: 'Attendance Board', href: '/attendance', icon: <MapPin size={18} />, section: 'operations' },
  { label: 'Shift Lifecycle', href: '/shifts', icon: <Clock size={18} />, section: 'operations' },
  { label: 'Inventory & Cafe', href: '/inventory', icon: <Package size={18} />, section: 'operations' },

  { label: 'Cash & Treasury', href: '/cash', icon: <Wallet size={18} />, section: 'finance' },
  { label: 'Expenses Log', href: '/expenses', icon: <Receipt size={18} />, section: 'finance' },
  { label: 'Withdrawals Queue', href: '/withdrawals', icon: <ArrowDownCircle size={18} />, section: 'finance' },
  { label: 'Payroll Center', href: '/payroll', icon: <DollarSign size={18} />, section: 'finance' },

  { label: 'Alert Center', href: '/action-center', icon: <AlertCircle size={18} />, section: 'support' },
  { label: 'Reports Panel', href: '/reports', icon: <BarChart3 size={18} />, section: 'support' },
  { label: 'Hardware Issues', href: '/hardware', icon: <Gamepad2 size={18} />, section: 'support' },
  { label: 'Lost & Found', href: '/lost-found', icon: <PackageSearch size={18} />, section: 'support' },
];

const customerNav: NavItem[] = [
  { label: 'Client Portal', href: '/', icon: <LayoutDashboard size={18} />, section: 'main' },
  { label: 'Book Session', href: '/reservations', icon: <CalendarClock size={18} />, section: 'main' },
  { label: 'Lost & Found Claims', href: '/lost-found', icon: <PackageSearch size={18} />, section: 'support' },
];

const sectionLabels: Record<string, string> = {
  main: 'Operations',
  operations: 'Management',
  finance: 'Finance & HR',
  support: 'System Support',
  crm: 'CRM',
  analytics: 'Analytics',
  system: 'Settings',
};

interface SidebarProps {
  currentPath: string;
  role?: 'owner' | 'manager' | 'staff' | 'customer';
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { currentRole, setRole, alerts, dismissAlert, language, setLanguage } = useApp();
  const { t } = useTranslation();

  const navItems =
    currentRole === 'customer' ? customerNav : currentRole === 'staff' ? staffNav : ownerNav; // Owner and Manager get full ownerNav

  const groupedNav = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const isActive = (href: string) => {
    return currentPath === href;
  };

  const roleLabel =
    currentRole === 'owner'
      ? t('Owner')
      : currentRole === 'manager'
        ? t('Manager')
        : currentRole === 'staff'
          ? t('Staff')
          : t('Customer');

  const roleColor =
    currentRole === 'owner'
      ? 'text-warning'
      : currentRole === 'manager'
        ? 'text-info'
        : currentRole === 'staff'
          ? 'text-accent'
          : 'text-indigo-400';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-card border border-border rounded-lg p-2 text-foreground"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-card border-r border-border h-full z-10 slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col h-full bg-card">
              {/* Logo */}
              <div className="flex items-center border-b border-border px-4 py-4 gap-3">
                <AppLogo size={32} />
                <div>
                  <span className="font-bold text-base text-foreground tracking-tight">{t('Zoox Hub')}</span>
                  <p className="text-xs text-muted-foreground">{t('Cafe & Gaming')}</p>
                </div>
              </div>

              {/* Role selector dropdown */}
              <div className="px-4 py-3 border-b border-border">
                <div className="bg-muted/80 rounded-lg p-2.5 space-y-2 border border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">ZX</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{t('Ahmed Hassan')}</p>
                      <p className={`text-[10px] font-medium ${roleColor}`}>{roleLabel}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1 font-bold">{t('Switch Role Tier')}</label>
                    <select
                      value={currentRole}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="bg-background border border-border text-xs rounded px-2 py-1 w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                    >
                      <option value="owner">{t('Owner')}</option>
                      <option value="manager">{t('Manager')}</option>
                      <option value="staff">{t('Staff')}</option>
                      <option value="customer">{t('Customer (Client)')}</option>
                    </select>
                  </div>
                  <div className="pt-2 border-t border-[#1F293D]/30">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1 font-bold">{t('Language / اللغة')}</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="bg-background border border-border text-xs rounded px-2 py-1 w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                    >
                      <option value="en">{t('English (LTR)')}</option>
                      <option value="ar">{t('العربية (RTL)')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
                {Object.entries(groupedNav).map(([section, items], sectionIdx) => (
                  <div key={`section-${section}`} className={sectionIdx > 0 ? 'mt-4' : ''}>
                    <p className="section-label px-3 mb-1.5 text-[10px] font-bold">{t(sectionLabels[section] || section)}</p>
                    {items.map((item) => (
                      <Link
                        key={`nav-${item.href}`}
                        href={item.href}
                        className={`nav-item mb-0.5 relative ${isActive(item.href) ? 'nav-item-active text-primary bg-primary/5 border-primary/20' : ''}`}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="truncate font-semibold">{t(item.label)}</span>
                        {item.badge && item.badge > 0 ? (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <div className="flex flex-col h-full bg-card">
          {/* Logo */}
          <div className={`flex items-center border-b border-border transition-all duration-300 ${collapsed ? 'justify-center px-3 py-4' : 'px-4 py-4 gap-3'}`}>
            <AppLogo size={32} />
            {!collapsed && (
              <div>
                <span className="font-bold text-base text-foreground tracking-tight">{t('Zoox Hub')}</span>
                <p className="text-xs text-muted-foreground">{t('Cafe & Gaming')}</p>
              </div>
            )}
          </div>

          {/* Role selector dropdown */}
          {!collapsed && (
            <div className="px-4 py-3 border-b border-border">
              <div className="bg-muted/80 rounded-lg p-2.5 space-y-2 border border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">ZX</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{t('Ahmed Hassan')}</p>
                    <p className={`text-[10px] font-medium ${roleColor}`}>{roleLabel}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/30">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1 font-bold">{t('Switch Role Tier')}</label>
                  <select
                    value={currentRole}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="bg-background border border-border text-xs rounded px-2 py-1 w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                  >
                    <option value="owner">{t('Owner')}</option>
                    <option value="manager">{t('Manager')}</option>
                    <option value="staff">{t('Staff')}</option>
                    <option value="customer">{t('Customer (Client)')}</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-border/30">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1 font-bold">{t('Language / اللغة')}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-background border border-border text-xs rounded px-2 py-1 w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                  >
                    <option value="en">{t('English (LTR)')}</option>
                    <option value="ar">{t('العربية (RTL)')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
            {Object.entries(groupedNav).map(([section, items], sectionIdx) => (
              <div key={`section-${section}`} className={sectionIdx > 0 ? 'mt-4' : ''}>
                {!collapsed && (
                  <p className="section-label px-3 mb-1.5 text-[10px] font-bold">{t(sectionLabels[section] || section)}</p>
                )}
                {items.map((item) => (
                  <Link
                    key={`nav-${item.href}`}
                    href={item.href}
                    className={`nav-item mb-0.5 relative ${isActive(item.href) ? 'nav-item-active text-primary bg-primary/5 border-primary/20' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                    title={collapsed ? t(item.label) : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate font-semibold">{t(item.label)}</span>}
                    {!collapsed && item.badge && item.badge > 0 ? (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="border-t border-border p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`nav-item w-full ${collapsed ? 'justify-center' : ''}`}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {!collapsed && <span>{t('Collapse')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
