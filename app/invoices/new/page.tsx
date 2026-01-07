'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoiceAdd } from '@/lib/hooks/useInvoiceAdd';
import { InvoiceAdd } from '@/lib/shared/types/invoice';
import { InvoiceFormClean } from '@/components/forms/invoice/InvoiceFormClean';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ invoice: InvoiceAdd; isValid: boolean } | null>(null);

  const { execute: addInvoice, loading: adding } = useInvoiceAdd({
    invoice: formData?.invoice,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        toast.success('Invoice created successfully!');
        router.push('/invoices');
      } else {
        toast.error(res.message || 'Failed to create invoice');
      }
    }
  });

  const getValidationMessage = () => {
    if (!formData?.invoice) return 'Fill in invoice details';
    
    const missing = [];
    if (!formData.invoice.invoiceNumber) missing.push('Invoice #');
    if (!formData.invoice.businessId || formData.invoice.businessId === 0) missing.push('Business');
    if (!formData.invoice.clientId || formData.invoice.clientId === 0) missing.push('Client');
    
    const validItems = formData.invoice.invoiceItems?.filter(item => item.itemId > 0).length ?? 0;
    if (validItems === 0) missing.push('at least one item');
    
    if (missing.length === 0) return '';
    return `Missing: ${missing.join(', ')}`;
  };

  const handleSave = () => {
    console.log('handleSave called', { formData, isValid: formData?.isValid });
    if (!formData?.isValid) {
      const message = getValidationMessage();
      toast.error(message || 'Please fill in all required fields');
      return;
    }
    console.log('Calling addInvoice with data:', formData.invoice);
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
            
            <div className="flex items-center gap-3">
              {!formData?.isValid && !adding && (
                <span className="text-xs text-[#666]">
                  {getValidationMessage()}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={!formData?.isValid || adding}
                title={!formData?.isValid ? getValidationMessage() : 'Create and save invoice'}
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
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1800px] px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Create New Invoice</h1>
          <p className="text-[13px] text-[#666]">Fill in the details to see a live preview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div>
            <InvoiceFormClean onChange={setFormData} />
          </div>

          {/* Right: Preview */}
          <div className="sticky top-20 self-start">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[#0d0d0d] mb-1">Live Preview</h2>
              <p className="text-xs text-[#666]">This is how your invoice will look</p>
            </div>
            {formData?.invoice ? (
              <InvoicePreview invoice={formData.invoice} />
            ) : (
              <div className="bg-white shadow-2xl rounded-sm border border-gray-200 p-10 min-h-[600px] flex items-center justify-center">
                <p className="text-sm text-gray-400">Fill in the form to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
