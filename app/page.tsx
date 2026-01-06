'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useInvoicesRetrieve } from '@/lib/hooks/useInvoicesRetrieve';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useAuth } from '@/lib/context/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { invoices } = useInvoicesRetrieve({ immediate: !!user });
  const { clients } = useClientsRetrieve({ immediate: !!user });

  if (authLoading) return null;
  if (!user) return null;

  // Calculate high-level stats
  const totalRevenue = invoices.reduce((acc, inv) => {
    const invTotal = inv.invoiceItems?.reduce((sum, item) => sum + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0;
    return acc + invTotal;
  }, 0) / 100;

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const outstandingAmount = unpaidInvoices.reduce((acc, inv) => {
    const invTotal = inv.invoiceItems?.reduce((sum, item) => sum + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0;
    return acc + invTotal;
  }, 0) / 100;

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Overview</h1>
          <p className="text-[13px] text-[#666]">Track your business performance and recent activity</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus size={16} strokeWidth={2} />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp size={16} strokeWidth={2} />} 
          trend="+12%"
          trendType="positive"
        />
        <StatCard 
          label="Outstanding" 
          value={`$${outstandingAmount.toLocaleString()}`} 
          icon={<Clock size={16} strokeWidth={2} />} 
          trend={`${unpaidInvoices.length} pending`}
          trendType="neutral"
        />
        <StatCard 
          label="Total Invoices" 
          value={invoices.length} 
          icon={<FileText size={16} strokeWidth={2} />} 
        />
        <StatCard 
          label="Active Clients" 
          value={clients.length} 
          icon={<Users size={16} strokeWidth={2} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e5e5] shadow-figma-sm overflow-hidden">
          <div className="px-5 h-12 border-b border-[#e5e5e5] flex justify-between items-center">
            <h3 className="text-[13px] font-semibold text-[#0d0d0d]">Recent Invoices</h3>
            <Link href="/invoices" className="text-[#0d99ff] text-[13px] font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-2 text-[11px] font-semibold text-[#666] uppercase">Invoice</th>
                  <th className="px-5 py-2 text-[11px] font-semibold text-[#666] uppercase">Client</th>
                  <th className="px-5 py-2 text-[11px] font-semibold text-[#666] uppercase">Amount</th>
                  <th className="px-5 py-2 text-[11px] font-semibold text-[#666] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-3">
                          <FileText size={20} className="text-[#999]" strokeWidth={2} />
                        </div>
                        <p className="text-[#999] text-[13px]">No recent activity</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-[#0d0d0d]">#{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-[#999]">{new Date(inv.issuedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-[#666]">{inv.clientNameSnapshot}</td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-[#0d0d0d]">
                        {inv.currencySymbolSnapshot}{((inv.invoiceItems?.reduce((s, i) => s + (i.unitPriceCentsSnapshot * i.quantity), 0) || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          inv.status === 'paid' ? 'bg-[#e6f9f0] text-[#0fa958]' : 'bg-[#fff3e6] text-[#f59e0b]'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Helpers */}
        <div className="space-y-4">
          <div className="bg-[#0d99ff] rounded-lg p-5 text-white">
            <h3 className="font-semibold text-sm mb-2">Need help?</h3>
            <p className="text-[13px] text-white/80 mb-4 leading-relaxed">Check out our guide on creating professional invoices</p>
            <button className="h-8 px-3 bg-white text-[#0d99ff] rounded text-[13px] font-medium hover:bg-white/90 transition-colors">
              Documentation
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e5e5] p-5 shadow-figma-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[13px] text-[#0d0d0d]">Upcoming Due Dates</h3>
              <Clock size={16} className="text-[#999]" strokeWidth={2} />
            </div>
            <div className="space-y-3">
              {invoices.filter(i => i.status === 'unpaid' && i.dueDate).slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-3 bg-[#fafafa] rounded hover:bg-[#f5f5f5] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f24822]" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#0d0d0d]">#{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-[#999]">Due {new Date(inv.dueDate!).toLocaleDateString()}</p>
                  </div>
                  <p className="text-[13px] font-semibold text-[#0d0d0d]">
                    ${((inv.invoiceItems?.reduce((s, i) => s + (i.unitPriceCentsSnapshot * i.quantity), 0) || 0) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
              {invoices.filter(i => i.status === 'unpaid' && i.dueDate).length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-[#e6f9f0] rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#0fa958]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-[#666]">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}