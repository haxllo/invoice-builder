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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5e5e5] hidden md:flex flex-col">
      {/* Brand */}
      <div className="flex items-center h-14 px-4 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0d99ff] rounded flex items-center justify-center">
            <FileText size={18} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-[#0d0d0d]">InvoiceBuilder</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                group flex items-center gap-3 px-3 h-8 text-[13px] font-medium rounded transition-all
                ${isActive 
                  ? 'bg-[#e5f2ff] text-[#0d99ff]' 
                  : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#0d0d0d]'}
              `}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-2 border-t border-[#e5e5e5]">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 h-8 text-[13px] font-medium text-[#666] rounded hover:bg-[#fff0f0] hover:text-[#f24822] transition-all"
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
