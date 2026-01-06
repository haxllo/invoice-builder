'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import { useBusinessesRetrieve } from '@/lib/hooks/useBusinessesRetrieve';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useItemsRetrieve } from '@/lib/hooks/useItemsRetrieve';
import { useCurrenciesRetrieve } from '@/lib/hooks/useCurrenciesRetrieve';
import type { Invoice, InvoiceAdd, InvoiceItem } from '@/lib/shared/types/invoice';
import { InvoiceItemTaxType, InvoiceTaxType } from '@/lib/shared/enums/taxType';
import { Plus, Trash, Info, CreditCard, Paintbrush, DollarSign } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice;
  onChange?: (data: { invoice: InvoiceAdd; isValid: boolean }) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onChange, invoice }) => {
  const { businesses } = useBusinessesRetrieve({ immediate: true });
  const { clients } = useClientsRetrieve({ immediate: true });
  const { items: savedItems } = useItemsRetrieve({ immediate: true });
  const { currencies } = useCurrenciesRetrieve({ immediate: true });

  const { form, update, setForm } = useForm<InvoiceAdd>({
    invoiceNumber: invoice?.invoiceNumber ?? '',
    issuedAt: invoice?.issuedAt ?? new Date().toISOString(),
    dueDate: invoice?.dueDate ?? '',
    businessId: invoice?.businessId ?? 0,
    clientId: invoice?.clientId ?? 0,
    currencyId: invoice?.currencyId ?? 1,
    status: invoice?.status ?? 'unpaid',
    invoiceType: invoice?.invoiceType ?? 'invoice',
    invoiceItems: invoice?.invoiceItems ?? [],
    customerNotes: invoice?.customerNotes ?? '',
    termsConditionNotes: invoice?.termsConditionNotes ?? '',
    
    // Snapshots
    businessNameSnapshot: invoice?.businessNameSnapshot ?? '',
    businessShortNameSnapshot: invoice?.businessShortNameSnapshot ?? '',
    businessAddressSnapshot: invoice?.businessAddressSnapshot ?? '',
    businessEmailSnapshot: invoice?.businessEmailSnapshot ?? '',
    clientNameSnapshot: invoice?.clientNameSnapshot ?? '',
    currencyCodeSnapshot: invoice?.currencyCodeSnapshot ?? 'USD',
    currencySymbolSnapshot: invoice?.currencySymbolSnapshot ?? '$',
    
    // Financials
    taxRate: invoice?.taxRate ?? 0,
    taxType: invoice?.taxType ?? InvoiceTaxType.exclusive,
    discountAmountCents: invoice?.discountAmountCents ?? 0,
    shippingFeeCents: invoice?.shippingFeeCents ?? 0,
    
    // Customization
    customizationColor: invoice?.customizationColor ?? '#4f46e5',
  } as InvoiceAdd);

  // Financial Calculations
  const totals = useMemo(() => {
    const subtotal = (form.invoiceItems?.reduce((acc, item) => 
      acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0);
    
    const taxAmount = (subtotal * (form.taxRate || 0)) / 100;
    const discount = form.discountAmountCents || 0;
    const shipping = form.shippingFeeCents || 0;
    
    const total = subtotal + (form.taxType === InvoiceTaxType.exclusive ? taxAmount : 0) - discount + shipping;
    
    return {
      subtotal: subtotal / 100,
      tax: taxAmount / 100,
      discount: discount / 100,
      shipping: shipping / 100,
      total: total / 100
    };
  }, [form.invoiceItems, form.taxRate, form.taxType, form.discountAmountCents, form.shippingFeeCents]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      itemId: 0,
      itemNameSnapshot: '',
      unitPriceCentsSnapshot: 0,
      quantity: 1,
      taxRate: 0,
      taxType: InvoiceItemTaxType.exclusive
    };
    update('invoiceItems', [...(form.invoiceItems || []), newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(form.invoiceItems || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    update('invoiceItems', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.invoiceItems || [])];
    newItems.splice(index, 1);
    update('invoiceItems', newItems);
  };

  useEffect(() => {
    const isValid = !!(form.invoiceNumber && form.businessId && form.clientId);
    onChange?.({ invoice: form, isValid });
  }, [form, onChange]);

  const labelClasses = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
  const inputClasses = "block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      {/* Main Invoice Sheet */}
      <div className="flex-1 bg-white shadow-2xl rounded-sm border border-gray-200 overflow-hidden min-h-[1000px]">
        {/* Header */}
        <div className="p-10 border-b border-gray-100 flex justify-between items-start gap-12 bg-gray-50/30">
          <div className="space-y-6 flex-1">
            <div 
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white"
              style={{ borderColor: form.customizationColor }}
            >
              {form.businessLogoSnapshot ? (
                <img src={form.businessLogoSnapshot as any} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-gray-300 uppercase">Logo</span>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>From</label>
                <select
                  className={inputClasses}
                  value={form.businessId}
                  onChange={(e) => {
                    const b = businesses.find(x => x.id === Number(e.target.value));
                    if (b) setForm({ ...form, businessId: b.id, businessNameSnapshot: b.name, businessAddressSnapshot: b.address || '', businessEmailSnapshot: b.email || '' });
                  }}
                >
                  <option value={0}>Choose your business...</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="text-sm text-gray-500 pl-1">
                <p className="font-bold text-gray-900">{form.businessNameSnapshot}</p>
                <p className="whitespace-pre-line">{form.businessAddressSnapshot}</p>
              </div>
            </div>
          </div>

          <div className="text-right space-y-6 min-w-[240px]">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Invoice</h1>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Invoice #</label>
                <input
                  type="text"
                  className="w-full text-right text-lg font-bold border-none p-0 focus:ring-0"
                  value={form.invoiceNumber}
                  onChange={(e) => update('invoiceNumber', e.target.value)}
                  placeholder="INV-0001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Date</label>
                  <input
                    type="date"
                    className="w-full text-right text-sm font-semibold border-none p-0 focus:ring-0"
                    value={form.issuedAt?.split('T')[0]}
                    onChange={(e) => update('issuedAt', new Date(e.target.value).toISOString())}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Due Date</label>
                  <input
                    type="date"
                    className="w-full text-right text-sm font-semibold border-none p-0 focus:ring-0"
                    value={form.dueDate?.split('T')[0]}
                    onChange={(e) => update('dueDate', new Date(e.target.value).toISOString())}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-10">
          <div className="max-w-xs">
            <label className={`${labelClasses} text-indigo-600`}>Bill To</label>
            <select
              className={inputClasses}
              value={form.clientId}
              onChange={(e) => {
                const c = clients.find(x => x.id === Number(e.target.value));
                if (c) setForm({ ...form, clientId: c.id, clientNameSnapshot: c.name });
              }}
            >
              <option value={0}>Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="mt-2 text-sm text-gray-500 pl-1">
              <p className="font-bold text-gray-900">{form.clientNameSnapshot}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-10 py-4">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className={`${labelClasses} text-left py-3 w-1/2`}>Description</th>
                <th className={`${labelClasses} text-center py-3`}>Quantity</th>
                <th className={`${labelClasses} text-right py-3`}>Price</th>
                <th className={`${labelClasses} text-right py-3 pr-4`}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.invoiceItems?.map((item, index) => (
                <tr key={index} className="group transition-colors hover:bg-gray-50/50">
                  <td className="py-5">
                    <div className="space-y-1">
                      <select
                        className="block border-none p-0 text-[10px] font-bold text-indigo-600 bg-transparent focus:ring-0"
                        value={item.itemId}
                        onChange={(e) => {
                          const saved = savedItems.find(x => x.id === Number(e.target.value));
                          if (saved) {
                            updateItem(index, 'itemId', saved.id);
                            updateItem(index, 'itemNameSnapshot', saved.name);
                            updateItem(index, 'unitPriceCentsSnapshot', Number(saved.amount) * 100);
                          }
                        }}
                      >
                        <option value={0}>Custom Product/Service</option>
                        {savedItems.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
                      </select>
                      <input
                        className="block w-full border-none p-0 text-sm font-semibold text-gray-900 focus:ring-0 bg-transparent"
                        value={item.itemNameSnapshot}
                        onChange={(e) => updateItem(index, 'itemNameSnapshot', e.target.value)}
                        placeholder="Item name..."
                      />
                    </div>
                  </td>
                  <td className="py-5">
                    <input
                      type="number"
                      className="w-full text-center border-none p-0 font-bold text-gray-700 focus:ring-0 bg-transparent"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-5">
                    <div className="flex items-center justify-end font-bold text-gray-700">
                      <span className="text-gray-300 text-[10px] mr-1">$</span>
                      <input
                        type="number"
                        className="w-20 border-none p-0 text-right focus:ring-0 bg-transparent"
                        value={item.unitPriceCentsSnapshot / 100}
                        onChange={(e) => updateItem(index, 'unitPriceCentsSnapshot', Number(e.target.value) * 100)}
                      />
                    </div>
                  </td>
                  <td className="py-5 text-right font-black text-gray-900 pr-4">
                    ${((item.quantity * item.unitPriceCentsSnapshot) / 100).toFixed(2)}
                  </td>
                  <td className="w-8">
                    <button onClick={() => removeItem(index)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addItem}
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-200 text-xs font-black uppercase text-gray-400 hover:border-indigo-500 hover:text-indigo-600 transition-all"
          >
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        {/* Footer Area */}
        <div className="mt-12 p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-12">
          <div className="flex-1 space-y-6">
            <div>
              <label className={labelClasses}>Notes to Client</label>
              <textarea
                rows={4}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Thanks for your business!"
                value={form.customerNotes}
                onChange={(e) => update('customerNotes', e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-80 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span className="text-gray-900">${totals.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-gray-400">Tax</span>
                <input
                  type="number"
                  className="w-12 text-xs font-bold border-none p-0 focus:ring-0 bg-transparent text-indigo-600"
                  value={form.taxRate}
                  onChange={(e) => update('taxRate', Number(e.target.value))}
                />
                <span className="text-[10px] text-gray-400">%</span>
              </div>
              <span className="text-sm font-bold text-gray-900">${totals.tax.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-400">Discount ($)</span>
              <div className="flex items-center">
                <span className="text-[10px] text-gray-400 mr-1">$</span>
                <input
                  type="number"
                  className="w-20 text-right text-xs font-bold border-none p-0 focus:ring-0 bg-transparent text-red-600"
                  value={(form.discountAmountCents || 0) / 100}
                  onChange={(e) => update('discountAmountCents', Number(e.target.value) * 100)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Total</span>
              <span className="text-3xl font-black text-indigo-600" style={{ color: form.customizationColor }}>
                {form.currencySymbolSnapshot}{totals.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 sticky top-8">
          <div>
            <h4 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest mb-4">
              <Paintbrush size={14} className="text-indigo-600" />
              Customization
            </h4>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Brand Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded border border-gray-200 cursor-pointer"
                    value={form.customizationColor}
                    onChange={(e) => update('customizationColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className={inputClasses}
                    value={form.customizationColor}
                    onChange={(e) => update('customizationColor', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest mb-4">
              <DollarSign size={14} className="text-indigo-600" />
              Financials
            </h4>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Currency</label>
                <select
                  className={inputClasses}
                  value={form.currencyId}
                  onChange={(e) => {
                    const cur = currencies.find(x => x.id === Number(e.target.value));
                    if (cur) update('currencyId', cur.id);
                  }}
                >
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Tax Type</label>
                <select
                  className={inputClasses}
                  value={form.taxType}
                  onChange={(e) => update('taxType', e.target.value as InvoiceTaxType)}
                >
                  <option value={InvoiceTaxType.exclusive}>Exclusive</option>
                  <option value={InvoiceTaxType.inclusive}>Inclusive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
