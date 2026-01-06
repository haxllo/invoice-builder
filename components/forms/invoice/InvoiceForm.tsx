'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import { useBusinessesRetrieve } from '@/lib/hooks/useBusinessesRetrieve';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useItemsRetrieve } from '@/lib/hooks/useItemsRetrieve';
import type { Invoice, InvoiceAdd, InvoiceItemAdd } from '@/lib/shared/types/invoice';
import { Plus, Trash } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice;
  onChange?: (data: { invoice: InvoiceAdd; isValid: boolean }) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onChange, invoice }) => {
  const { businesses } = useBusinessesRetrieve({ immediate: true });
  const { clients } = useClientsRetrieve({ immediate: true });
  const { items: savedItems } = useItemsRetrieve({ immediate: true });

  const { form, update, setForm } = useForm<InvoiceAdd>({
    invoiceNumber: invoice?.invoiceNumber ?? '',
    issuedAt: invoice?.issuedAt ?? new Date().toISOString(),
    dueDate: invoice?.dueDate ?? '',
    businessId: invoice?.businessId ?? 0,
    clientId: invoice?.clientId ?? 0,
    currencyId: invoice?.currencyId ?? 1, // Default to 1 (USD usually)
    status: invoice?.status ?? 'unpaid',
    invoiceType: invoice?.invoiceType ?? 'invoice',
    items: invoice?.invoice_items?.map(i => ({
        itemId: i.itemId,
        itemNameSnapshot: i.itemNameSnapshot,
        unitPriceCentsSnapshot: i.unitPriceCentsSnapshot,
        quantity: i.quantity,
        taxRate: i.taxRate,
        taxType: i.taxType
    })) ?? [],
    // ... map other fields
    customerNotes: invoice?.customerNotes ?? '',
    termsConditionNotes: invoice?.termsConditionNotes ?? '',
    // Snapshots will be populated on save/submit logic usually, but for UI we track IDs
  } as any); // Type casting for speed in migration

  // Helper to add item row
  const addItem = () => {
    const newItem: InvoiceItemAdd = {
      itemId: 0,
      itemNameSnapshot: '',
      unitPriceCentsSnapshot: 0,
      quantity: 1,
      taxRate: 0,
      taxType: 'exclusive'
    };
    // @ts-ignore
    update('items', [...(form.items || []), newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItemAdd, value: any) => {
    const newItems = [...(form.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    // @ts-ignore
    update('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems.splice(index, 1);
    // @ts-ignore
    update('items', newItems);
  };

  // Effect to validate and bubble up changes
  useEffect(() => {
    const isValid = form.invoiceNumber !== '' && form.businessId !== 0 && form.clientId !== 0;
    onChange?.({ invoice: form, isValid });
  }, [form, onChange]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm border border-gray-200 overflow-hidden">
      {/* Invoice Header */}
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded">
            Invoice Draft
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Invoice Number</label>
            <input
              type="text"
              placeholder="INV-0001"
              className="mt-1 block w-full text-2xl font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-200"
              value={form.invoiceNumber}
              onChange={(e) => update('invoiceNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Issued Date</label>
            <input
              type="date"
              className="mt-1 block w-full text-sm font-semibold text-gray-700 border-none p-0 focus:ring-0"
              value={form.issuedAt.split('T')[0]}
              onChange={(e) => update('issuedAt', new Date(e.target.value).toISOString())}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Due Date</label>
            <input
              type="date"
              className="mt-1 block w-full text-sm font-semibold text-gray-700 border-none p-0 focus:ring-0"
              value={form.dueDate ? form.dueDate.split('T')[0] : ''}
              onChange={(e) => update('dueDate', new Date(e.target.value).toISOString())}
            />
          </div>
        </div>
      </div>

      <div className="p-10 space-y-12">
        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider text-indigo-600">From (Provider)</label>
            <select
              className="block w-full rounded-lg border-gray-200 bg-gray-50 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500"
              value={form.businessId}
              onChange={(e) => {
                const id = Number(e.target.value);
                const b = businesses.find(x => x.id === id);
                if (b) {
                  setForm(prev => ({
                    ...prev,
                    businessId: id,
                    businessNameSnapshot: b.name,
                    businessShortNameSnapshot: b.shortName,
                    businessAddressSnapshot: b.address || '',
                    businessEmailSnapshot: b.email || '',
                    businessPhoneSnapshot: b.phone || '',
                    businessRoleSnapshot: b.role || '',
                    businessLogoSnapshot: typeof b.logo === 'string' ? b.logo : ''
                  }));
                }
              }}
            >
              <option value={0}>Select Business</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {form.businessId !== 0 && (
              <div className="mt-4 text-sm text-gray-500 space-y-1 pl-1 border-l-2 border-indigo-100">
                <p className="font-bold text-gray-900">{form.businessNameSnapshot}</p>
                <p>{form.businessAddressSnapshot}</p>
                <p>{form.businessEmailSnapshot}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider text-indigo-600">Bill To (Client)</label>
            <select
              className="block w-full rounded-lg border-gray-200 bg-gray-50 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500"
              value={form.clientId}
              onChange={(e) => {
                const id = Number(e.target.value);
                const c = clients.find(x => x.id === id);
                if (c) {
                  setForm(prev => ({
                    ...prev,
                    clientId: id,
                    clientNameSnapshot: c.name,
                    clientAddressSnapshot: c.address || '',
                    clientEmailSnapshot: c.email || '',
                    clientPhoneSnapshot: c.phone || '',
                    clientCodeSnapshot: c.code || ''
                  }));
                }
              }}
            >
              <option value={0}>Select Client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {form.clientId !== 0 && (
              <div className="mt-4 text-sm text-gray-500 space-y-1 pl-1 border-l-2 border-indigo-100">
                <p className="font-bold text-gray-900">{form.clientNameSnapshot}</p>
                <p>{form.clientAddressSnapshot}</p>
                <p>{form.clientEmailSnapshot}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Line Items</h3>
          </div>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 w-1/2">Description</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* @ts-ignore */}
                {form.items?.map((item: InvoiceItemAdd, index: number) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          className="block w-full border-none p-0 text-xs font-semibold text-indigo-600 bg-transparent focus:ring-0"
                          value={item.itemId}
                          onChange={(e) => {
                            const id = Number(e.target.value);
                            const saved = savedItems.find(x => x.id === id);
                            if (saved) {
                              updateItem(index, 'itemId', id);
                              updateItem(index, 'itemNameSnapshot', saved.name);
                              updateItem(index, 'unitPriceCentsSnapshot', Number(saved.amount) * 100);
                            }
                          }}
                        >
                          <option value={0}>Custom Line Item</option>
                          {savedItems.map(si => (
                            <option key={si.id} value={si.id}>{si.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="block w-full border-none p-0 text-sm font-medium text-gray-900 bg-transparent focus:ring-0 placeholder:text-gray-300"
                          value={item.itemNameSnapshot}
                          onChange={(e) => updateItem(index, 'itemNameSnapshot', e.target.value)}
                          placeholder="What service or product are you providing?"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="block w-full border-none p-0 text-center font-semibold text-gray-700 bg-transparent focus:ring-0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end font-semibold text-gray-700">
                        <span className="text-xs text-gray-400 mr-1">$</span>
                        <input
                          type="number"
                          className="w-20 border-none p-0 text-right focus:ring-0 bg-transparent"
                          value={item.unitPriceCentsSnapshot / 100}
                          onChange={(e) => updateItem(index, 'unitPriceCentsSnapshot', Number(e.target.value) * 100)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${((item.quantity * item.unitPriceCentsSnapshot) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50/50 p-4 border-t border-gray-100">
              <button
                onClick={addItem}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 tracking-wider uppercase"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="flex flex-col md:flex-row gap-12 pt-8 border-t border-gray-100">
          <div className="flex-grow space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Include payment terms, bank details or a simple thank you..."
                className="block w-full rounded-lg border-gray-200 bg-gray-50 text-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder:italic"
                value={form.customerNotes}
                onChange={(e) => update('customerNotes', e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-72 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              {/* @ts-ignore */}
              <span className="font-semibold text-gray-900">${((form.items?.reduce((acc, item) => acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 border-b border-gray-100 pb-3">
              <span>Tax (0%)</span>
              <span className="font-semibold text-gray-900">$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2">
              <span className="uppercase tracking-wider">Total</span>
              <span className="text-indigo-600">
                {/* @ts-ignore */}
                ${((form.items?.reduce((acc, item) => acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
