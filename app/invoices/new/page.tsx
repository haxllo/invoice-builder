'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoiceAdd } from '@/lib/hooks/useInvoiceAdd';
import { InvoiceAdd } from '@/lib/shared/types/invoice';
import { InvoiceForm } from '@/components/forms/invoice/InvoiceForm';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ invoice: InvoiceAdd; isValid: boolean } | null>(null);

  const { execute: addInvoice, loading: adding } = useInvoiceAdd({
    invoice: formData?.invoice,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        router.push('/invoices');
      }
    }
  });

  const handleSave = () => {
    if (!formData?.isValid) return;
    addInvoice();
  };

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
              disabled={!formData?.isValid || adding}
            >
              {adding ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={2} />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Create New Invoice</h1>
          <p className="text-[13px] text-[#666]">Fill in the details below</p>
        </div>

        <InvoiceForm onChange={setFormData} />
      </div>
    </div>
  );
}
