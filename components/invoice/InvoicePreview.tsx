'use client';

import React from 'react';
import type { InvoiceAdd } from '@/lib/shared/types/invoice';

interface InvoicePreviewProps {
  invoice: InvoiceAdd;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const subtotal = (invoice.invoiceItems?.reduce((acc, item) => 
    acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0) / 100;
  
  const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
  const discount = (invoice.discountAmountCents || 0) / 100;
  const shipping = (invoice.shippingFeeCents || 0) / 100;
  const total = subtotal + taxAmount - discount + shipping;

  return (
    <div className="bg-white shadow-2xl rounded-sm border border-gray-200 overflow-hidden min-h-[1000px] p-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          <div 
            className="w-24 h-24 rounded border-2 border-dashed border-[#e5e5e5] flex items-center justify-center bg-white"
            style={{ borderColor: invoice.customizationColor }}
          >
            {invoice.businessLogoSnapshot ? (
              <img src={invoice.businessLogoSnapshot as any} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-gray-300 uppercase">Logo</span>
            )}
          </div>
          
          <div>
            <p className="text-sm font-bold text-[#0d0d0d]">{invoice.businessNameSnapshot || 'Your Business'}</p>
            <p className="text-xs text-[#666] whitespace-pre-line">{invoice.businessAddressSnapshot}</p>
            <p className="text-xs text-[#666]">{invoice.businessEmailSnapshot}</p>
          </div>
        </div>
        
        <div className="text-right">
          <h1 className="text-4xl font-black text-[#0d0d0d] mb-4">INVOICE</h1>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Invoice #</span>
              <p className="text-lg font-bold">{invoice.invoiceNumber || 'INV-0001'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Date</span>
              <p className="text-sm font-semibold">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : '--'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Due Date</span>
              <p className="text-sm font-semibold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '--'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-wide mb-2 block" style={{ color: invoice.customizationColor }}>
          Bill To
        </span>
        <p className="text-sm font-bold text-[#0d0d0d]">{invoice.clientNameSnapshot || 'Select a client'}</p>
        {invoice.clientAddressSnapshot && (
          <p className="text-xs text-[#666] whitespace-pre-line">{invoice.clientAddressSnapshot}</p>
        )}
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide text-left py-3">Description</th>
              <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide text-center py-3">Quantity</th>
              <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide text-right py-3">Price</th>
              <th className="text-[10px] font-bold text-gray-600 uppercase tracking-wide text-right py-3 pr-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.invoiceItems && invoice.invoiceItems.length > 0 ? (
              invoice.invoiceItems.filter(item => item.itemId > 0).map((item, index) => (
                <tr key={index}>
                  <td className="py-4">
                    <p className="text-sm font-semibold text-[#0d0d0d]">{item.itemNameSnapshot || 'Item name'}</p>
                    <p className="text-xs text-[#666]">{item.unitNameSnapshot}</p>
                  </td>
                  <td className="text-center">
                    <span className="text-sm font-semibold text-[#0d0d0d]">{item.quantity}</span>
                  </td>
                  <td className="text-right">
                    <span className="text-sm font-semibold text-[#0d0d0d]">
                      {invoice.currencySymbolSnapshot}{(item.unitPriceCentsSnapshot / 100).toFixed(2)}
                    </span>
                  </td>
                  <td className="text-right pr-4">
                    <span className="text-sm font-bold text-[#0d0d0d]">
                      {invoice.currencySymbolSnapshot}{((item.unitPriceCentsSnapshot * item.quantity) / 100).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                  No items added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-600">Subtotal</span>
            <span className="text-sm font-bold text-[#0d0d0d]">
              {invoice.currencySymbolSnapshot}{subtotal.toFixed(2)}
            </span>
          </div>
          
          {(invoice.taxRate || 0) > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Tax ({invoice.taxRate}%)</span>
              <span className="text-sm font-bold text-[#0d0d0d]">
                {invoice.currencySymbolSnapshot}{taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Discount</span>
              <span className="text-sm font-bold text-red-600">
                -{invoice.currencySymbolSnapshot}{discount.toFixed(2)}
              </span>
            </div>
          )}
          
          {shipping > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Shipping</span>
              <span className="text-sm font-bold text-[#0d0d0d]">
                {invoice.currencySymbolSnapshot}{shipping.toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
            <span className="text-xl font-black text-gray-900 uppercase">Total</span>
            <span className="text-3xl font-black" style={{ color: invoice.customizationColor }}>
              {invoice.currencySymbolSnapshot}{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.customerNotes && (
        <div className="mb-6">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 block">
            Notes to Client
          </span>
          <p className="text-sm text-[#666] whitespace-pre-line">{invoice.customerNotes}</p>
        </div>
      )}
    </div>
  );
};
