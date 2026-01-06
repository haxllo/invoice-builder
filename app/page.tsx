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

export default function OverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { invoices } = useInvoicesRetrieve({ immediate: !!user });
  const { clients } = useClientsRetrieve({ immediate: !!user });

  if (authLoading) return null;
  if (!user) return null;

  // Calculate high-level stats
  const totalRevenue = invoices.reduce((acc, inv) => {
    const invTotal = inv.invoice_items?.reduce((sum, item) => sum + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0;
    return acc + invTotal;
  }, 0) / 100;

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const outstandingAmount = unpaidInvoices.reduce((acc, inv) => {
    const invTotal = inv.invoice_items?.reduce((sum, item) => sum + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0;
    return acc + invTotal;
  }, 0) / 100;

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, here is what&apos;s happening with your business.</p>
        </div>
        <Link 
          href="/invoices" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={18} />
          New Invoice
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp size={20} />} 
          trend="+12% from last month"
          trendType="positive"
        />
        <StatCard 
          label="Outstanding" 
          value={`$${outstandingAmount.toLocaleString()}`} 
          icon={<Clock size={20} />} 
          trend={`${unpaidInvoices.length} pending invoices`}
          trendType="neutral"
        />
        <StatCard 
          label="Total Invoices" 
          value={invoices.length} 
          icon={<FileText size={20} />} 
        />
        <StatCard 
          label="Active Clients" 
          value={clients.length} 
          icon={<Users size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Invoices</h3>
            <Link href="/invoices" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Invoice</th>
                  <th className="px-6 py-3 font-semibold">Client</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm italic">No recent activity</td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">#{inv.invoiceNumber}</span>
                        <span className="text-xs text-gray-500">{new Date(inv.issuedAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inv.clientNameSnapshot}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {inv.currencySymbolSnapshot}{((inv.invoice_items?.reduce((s, i) => s + (i.unitPriceCentsSnapshot * i.quantity), 0) || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                        `}>
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
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
            <h3 className="font-bold text-lg mb-2 text-white">Need help?</h3>
            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">Check out our guide on how to create professional invoices and manage your clients effectively.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
              Documentation
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Upcoming Due Dates</h3>
            <div className="space-y-4">
              {invoices.filter(i => i.status === 'unpaid' && i.dueDate).slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">#{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">Due {new Date(inv.dueDate!).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${((inv.invoice_items?.reduce((s, i) => s + (i.unitPriceCentsSnapshot * i.quantity), 0) || 0) / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {invoices.filter(i => i.status === 'unpaid' && i.dueDate).length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">All caught up!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}