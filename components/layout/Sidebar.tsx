'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Settings, 
  LogOut, 
  Briefcase 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading || !user || pathname === '/login') return null;

  const links = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/businesses', label: 'Businesses', icon: Briefcase },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/items', label: 'Items catalog', icon: Package },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-indigo-600">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <FileText size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">Invoice<span className="text-indigo-600">Builder</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
