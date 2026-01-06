'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoicesRetrieve } from '@/lib/hooks/useInvoicesRetrieve';
import { useInvoiceUpdate } from '@/lib/hooks/useInvoiceUpdate';
import { InvoiceUpdate } from '@/lib/shared/types/invoice';
import { InvoiceForm } from '@/components/forms/invoice/InvoiceForm';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function EditInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id');
  
  const [formData, setFormData] = useState<{ invoice: InvoiceUpdate; isValid: boolean } | null>(null);
  const { invoices } = useInvoicesRetrieve({ immediate: true });
  
  const invoice = invoices.find(inv => inv.id === Number(invoiceId));

  const { execute: updateInvoice, loading: updating } = useInvoiceUpdate({
    invoice: formData?.invoice as InvoiceUpdate,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        router.push('/invoices');
      }
    }
  });

  const handleSave = () => {
    if (!formData?.isValid) return;
    updateInvoice();
  };

  const handleFormChange = (data: { invoice: any; isValid: boolean }) => {
    setFormData(data as { invoice: InvoiceUpdate; isValid: boolean });
  };

  if (!invoice && invoices.length > 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-8 text-center shadow-figma">
          <h1 className="text-[15px] font-semibold text-[#0d0d0d] mb-2">Invoice not found</h1>
          <Link href="/invoices" className="text-[#0d99ff] text-[13px] font-medium hover:underline">
            Return to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5] shadow-figma-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-12 items-center justify-between">
            <Link
              href="/invoices"
              className="flex items-center gap-2 text-[13px] font-medium text-[#666] hover:text-[#0d0d0d] transition-colors"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Back
            </Link>
            
            <Button
              onClick={handleSave}
              disabled={!formData?.isValid || updating}
            >
              {updating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={2} />
                  Update Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Edit Invoice</h1>
          <p className="text-[13px] text-[#666]">Update your invoice details</p>
        </div>

        {invoice && <InvoiceForm invoice={invoice} onChange={handleFormChange} />}
      </div>
    </div>
  );
}

export default function EditInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0d99ff]" />
      </div>
    }>
      <EditInvoiceContent />
    </Suspense>
  );
}
