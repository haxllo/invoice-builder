'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoicesRetrieve } from '@/lib/hooks/useInvoicesRetrieve';
import { useInvoiceDelete } from '@/lib/hooks/useInvoiceDelete';
import { Invoice } from '@/lib/shared/types/invoice';
import { Plus, FileText, Edit2, Trash, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice/InvoicePDF';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { invoices, execute: refreshInvoices, loading: fetching } = useInvoicesRetrieve({
    immediate: true,
  });

  const { execute: deleteInvoice } = useInvoiceDelete({
    id: 0,
    immediate: false,
    onDone: (res) => {
      if (res.success) refreshInvoices();
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Invoices</h1>
            <p className="text-[13px] text-[#666]">Create and manage your professional invoices</p>
          </div>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus size={16} strokeWidth={2} />
              Create Invoice
            </Link>
          </Button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-[#e5e5e5] shadow-figma overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase">Invoice</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase">Client</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase">Amount</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-3">
                          <FileText size={20} className="text-[#999] animate-pulse" strokeWidth={2} />
                        </div>
                        <p className="text-[#999] text-[13px]">Loading invoices...</p>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-3">
                          <FileText size={20} className="text-[#999]" strokeWidth={2} />
                        </div>
                        <p className="text-[#666] text-[13px] font-medium mb-1">No invoices found</p>
                        <Link
                          href="/invoices/new"
                          className="mt-3 text-[#0d99ff] text-[13px] font-medium hover:underline"
                        >
                          Create your first invoice →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-[#0d0d0d]">#{invoice.invoiceNumber}</div>
                        <div className="text-[11px] text-[#999]">{new Date(invoice.issuedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-medium text-[#0d0d0d]">{invoice.clientNameSnapshot}</div>
                        <div className="text-[11px] text-[#999]">From: {invoice.businessNameSnapshot}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-[#0d0d0d]">
                          {invoice.currencySymbolSnapshot}{((invoice.invoiceItems?.reduce((acc, item) => acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0) / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          invoice.status === 'paid' ? 'bg-[#e6f9f0] text-[#0fa958]' : 'bg-[#fff3e6] text-[#f59e0b]'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          {isClient && (
                            <PDFDownloadLink
                              document={<InvoicePDF invoice={invoice} />}
                              fileName={`Invoice-${invoice.invoiceNumber}.pdf`}
                              className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#0d99ff] hover:bg-[#f5f5f5] rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download size={16} strokeWidth={2} />
                            </PDFDownloadLink>
                          )}
                          <Link 
                            href={`/invoices/edit?id=${invoice.id}`}
                            className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#0d99ff] hover:bg-[#f5f5f5] rounded transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </Link>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(invoice.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#f24822] hover:bg-[#fff0f0] rounded transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}