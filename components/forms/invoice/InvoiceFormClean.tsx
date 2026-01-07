'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import { useBusinessesRetrieve } from '@/lib/hooks/useBusinessesRetrieve';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useItemsRetrieve } from '@/lib/hooks/useItemsRetrieve';
import { useCurrenciesRetrieve } from '@/lib/hooks/useCurrenciesRetrieve';
import type { Invoice, InvoiceAdd, InvoiceItem } from '@/lib/shared/types/invoice';
import type { InvoiceStatus } from '@/lib/shared/enums/invoiceStatus';
import { InvoiceItemTaxType, InvoiceTaxType } from '@/lib/shared/enums/taxType';
import { Plus, Trash, Info, X, DollarSign, Paintbrush, FileText, User, Building } from 'lucide-react';
import { validateFinancialAmount, validateQuantity, validateTaxRate } from '@/lib/shared/utils/securityValidation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface InvoiceFormSimplifiedProps {
  invoice?: Invoice;
  onChange?: (data: { invoice: InvoiceAdd; isValid: boolean }) => void;
}

export const InvoiceFormClean: React.FC<InvoiceFormSimplifiedProps> = ({ onChange, invoice }) => {
  const { businesses } = useBusinessesRetrieve({ immediate: true });
  const { clients } = useClientsRetrieve({ immediate: true });
  const { items: savedItems } = useItemsRetrieve({ immediate: true });
  const { currencies } = useCurrenciesRetrieve({ immediate: true });
  
  const [validationError, setValidationError] = useState<string>('');

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
    currencySubunitSnapshot: invoice?.currencySubunitSnapshot ?? 100,
    
    // Financials
    taxRate: invoice?.taxRate ?? 0,
    taxType: invoice?.taxType ?? InvoiceTaxType.exclusive,
    discountAmountCents: invoice?.discountAmountCents ?? 0,
    discountPercent: invoice?.discountPercent ?? 0,
    shippingFeeCents: invoice?.shippingFeeCents ?? 0,
    
    // Customization
    customizationColor: invoice?.customizationColor ?? '#4f46e5',
    customizationLogoSize: invoice?.customizationLogoSize ?? 'medium',
    customizationFontSizeSize: invoice?.customizationFontSizeSize ?? 'medium',
    customizationLayout: invoice?.customizationLayout ?? 'classic',
    customizationTableHeaderStyle: invoice?.customizationTableHeaderStyle ?? 'light',
    customizationTableRowStyle: invoice?.customizationTableRowStyle ?? 'classic',
    customizationPageFormat: invoice?.customizationPageFormat ?? 'A4',
    customizationLabelUpperCase: invoice?.customizationLabelUpperCase ?? false,
  } as InvoiceAdd);

  const addItem = () => {
    const newItem: InvoiceItem = {
      itemId: 0,
      itemNameSnapshot: '',
      unitPriceCentsSnapshot: 0,
      unitNameSnapshot: '',
      quantity: 1,
      taxRate: 0,
      taxType: InvoiceItemTaxType.exclusive
    };
    update('invoiceItems', [...(form.invoiceItems || []), newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    try {
      setValidationError('');
      let validatedValue = value;
      
      if (field === 'quantity') {
        validatedValue = validateQuantity(value, 'Quantity');
      } else if (field === 'unitPriceCentsSnapshot') {
        const dollarAmount = Number(value) / 100;
        validateFinancialAmount(dollarAmount, 'Unit price');
        validatedValue = value;
      } else if (field === 'taxRate') {
        validatedValue = validateTaxRate(value, 'Item tax rate');
      }
      
      const newItems = [...(form.invoiceItems || [])];
      newItems[index] = { ...newItems[index], [field]: validatedValue };
      update('invoiceItems', newItems);
    } catch (error: any) {
      setValidationError(error.message);
      const newItems = [...(form.invoiceItems || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      update('invoiceItems', newItems);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.invoiceItems || [])];
    newItems.splice(index, 1);
    update('invoiceItems', newItems);
  };

  useEffect(() => {
    const hasValidItems = (form.invoiceItems?.filter(item => item.itemId > 0).length ?? 0) > 0;
    const isValid = !!(form.invoiceNumber && form.businessId && form.clientId && hasValidItems);
    onChange?.({ invoice: form, isValid });
  }, [form, onChange]);

  const labelClasses = "block text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-1.5";

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <Info size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">Validation Error</p>
            <p className="text-xs text-red-700 mt-1">{validationError}</p>
          </div>
          <button 
            onClick={() => setValidationError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Invoice Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide flex items-center gap-2">
          <FileText size={14} className="text-[#0d99ff]" strokeWidth={2} />
          Invoice Details
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Invoice Number *</label>
            <Input
              type="text"
              className="h-8"
              value={form.invoiceNumber}
              onChange={(e) => update('invoiceNumber', e.target.value)}
              placeholder="INV-0001"
            />
          </div>
          
          <div>
            <label className={labelClasses}>Status</label>
            <Select value={form.status} onValueChange={(value) => update('status', value as InvoiceStatus)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially">Partially Paid</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Issue Date *</label>
            <Input
              type="date"
              className="h-8"
              value={form.issuedAt?.split('T')[0]}
              onChange={(e) => update('issuedAt', new Date(e.target.value).toISOString())}
            />
          </div>
          
          <div>
            <label className={labelClasses}>Due Date</label>
            <Input
              type="date"
              className="h-8"
              value={form.dueDate?.split('T')[0]}
              onChange={(e) => update('dueDate', new Date(e.target.value).toISOString())}
            />
          </div>
        </div>
      </div>

      {/* Business Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide flex items-center gap-2">
          <Building size={14} className="text-[#0d99ff]" strokeWidth={2} />
          From (Your Business) *
        </h3>
        
        <div>
          <label className={labelClasses}>Select Business *</label>
          <Select
            value={String(form.businessId)}
            onValueChange={(value) => {
              const b = businesses.find(x => x.id === Number(value));
              if (b) setForm({ 
                ...form, 
                businessId: b.id, 
                businessNameSnapshot: b.name, 
                businessShortNameSnapshot: b.shortName || '',
                businessAddressSnapshot: b.address || '', 
                businessEmailSnapshot: b.email || '' 
              });
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Choose your business..." />
            </SelectTrigger>
            <SelectContent>
              {businesses.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.businessNameSnapshot && (
            <div className="mt-2 text-xs text-[#666] bg-gray-50 p-3 rounded">
              <p className="font-semibold text-[#0d0d0d]">{form.businessNameSnapshot}</p>
              {form.businessAddressSnapshot && (
                <p className="whitespace-pre-line mt-1">{form.businessAddressSnapshot}</p>
              )}
              {form.businessEmailSnapshot && <p className="mt-1">{form.businessEmailSnapshot}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Client Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide flex items-center gap-2">
          <User size={14} className="text-[#0d99ff]" strokeWidth={2} />
          Bill To (Client) *
        </h3>
        
        <div>
          <label className={labelClasses}>Select Client *</label>
          <Select
            value={String(form.clientId)}
            onValueChange={(value) => {
              const c = clients.find(x => x.id === Number(value));
              if (c) setForm({ ...form, clientId: c.id, clientNameSnapshot: c.name, clientAddressSnapshot: c.address || '' });
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.clientNameSnapshot && (
            <div className="mt-2 text-xs text-[#666] bg-gray-50 p-3 rounded">
              <p className="font-semibold text-[#0d0d0d]">{form.clientNameSnapshot}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide">Line Items *</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="h-7 text-xs"
          >
            <Plus size={14} className="mr-1" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {form.invoiceItems?.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelClasses}>Select Item *</label>
                    <Select
                      value={item.itemId > 0 ? String(item.itemId) : undefined}
                      onValueChange={(value) => {
                        const saved = savedItems.find(x => x.id === Number(value));
                        if (saved) {
                          const newItems = [...(form.invoiceItems || [])];
                          newItems[index] = {
                            ...newItems[index],
                            itemId: saved.id,
                            itemNameSnapshot: saved.name,
                            unitPriceCentsSnapshot: Number(saved.amount) * 100,
                            unitNameSnapshot: saved.unitName || ''
                          };
                          update('invoiceItems', newItems);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select an item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedItems.map(si => (
                          <SelectItem key={si.id} value={String(si.id)}>
                            {si.name} - {form.currencySymbolSnapshot}{si.amount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClasses}>Quantity</label>
                      <Input
                        type="number"
                        className="h-8"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={labelClasses}>Price ({form.currencySymbolSnapshot})</label>
                      <Input
                        type="number"
                        className="h-8"
                        value={(item.unitPriceCentsSnapshot / 100).toFixed(2)}
                        onChange={(e) => updateItem(index, 'unitPriceCentsSnapshot', parseFloat(e.target.value) * 100 || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className={labelClasses}>Amount</label>
                      <Input
                        type="text"
                        className="h-8 bg-white"
                        value={`${form.currencySymbolSnapshot}${((item.unitPriceCentsSnapshot * item.quantity) / 100).toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-6 text-red-400 hover:text-red-600 transition-colors"
                  title="Remove item"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {(!form.invoiceItems || form.invoiceItems.length === 0) && (
            <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              No items added. Click "Add Item" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Financials Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide flex items-center gap-2">
          <DollarSign size={14} className="text-[#0d99ff]" strokeWidth={2} />
          Financials
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Currency</label>
            <Select
              value={String(form.currencyId)}
              onValueChange={(value) => {
                const cur = currencies.find(x => x.id === Number(value));
                if (cur) {
                  update('currencyId', cur.id);
                  update('currencyCodeSnapshot', cur.code);
                  update('currencySymbolSnapshot', cur.symbol);
                  update('currencySubunitSnapshot', cur.subunit);
                }
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.code} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className={labelClasses}>Tax Type</label>
            <Select
              value={form.taxType}
              onValueChange={(value) => update('taxType', value as InvoiceTaxType)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceTaxType.exclusive}>Exclusive</SelectItem>
                <SelectItem value={InvoiceTaxType.inclusive}>Inclusive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Tax Rate (%)</label>
            <Input
              type="number"
              className="h-8"
              value={form.taxRate}
              onChange={(e) => {
                try {
                  const validated = validateTaxRate(e.target.value, 'Tax rate');
                  update('taxRate', validated);
                  setValidationError('');
                } catch (error: any) {
                  setValidationError(error.message);
                }
              }}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          
          <div>
            <label className={labelClasses}>Discount ({form.currencySymbolSnapshot})</label>
            <Input
              type="number"
              className="h-8"
              value={((form.discountAmountCents || 0) / 100).toFixed(2)}
              onChange={(e) => {
                try {
                  const validated = validateFinancialAmount(e.target.value, 'Discount');
                  update('discountAmountCents', validated * 100);
                  setValidationError('');
                } catch (error: any) {
                  setValidationError(error.message);
                }
              }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Shipping ({form.currencySymbolSnapshot})</label>
            <Input
              type="number"
              className="h-8"
              value={((form.shippingFeeCents || 0) / 100).toFixed(2)}
              onChange={(e) => {
                try {
                  const validated = validateFinancialAmount(e.target.value, 'Shipping');
                  update('shippingFeeCents', validated * 100);
                  setValidationError('');
                } catch (error: any) {
                  setValidationError(error.message);
                }
              }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Customization Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide flex items-center gap-2">
          <Paintbrush size={14} className="text-[#0d99ff]" strokeWidth={2} />
          Customization
        </h3>
        
        <div>
          <label className={labelClasses}>Brand Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              className="h-8 w-12 rounded border border-[#e5e5e5] cursor-pointer"
              value={form.customizationColor}
              onChange={(e) => update('customizationColor', e.target.value)}
            />
            <Input
              type="text"
              className="h-8"
              value={form.customizationColor}
              onChange={(e) => update('customizationColor', e.target.value)}
              placeholder="#4f46e5"
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wide">Notes</h3>
        
        <div>
          <label className={labelClasses}>Notes to Client</label>
          <Textarea
            className="min-h-[80px] text-[13px]"
            value={form.customerNotes}
            onChange={(e) => update('customerNotes', e.target.value)}
            placeholder="Thank you for your business!"
          />
        </div>
        
        <div>
          <label className={labelClasses}>Terms & Conditions</label>
          <Textarea
            className="min-h-[80px] text-[13px]"
            value={form.termsConditionNotes}
            onChange={(e) => update('termsConditionNotes', e.target.value)}
            placeholder="Payment terms, late fees, etc."
          />
        </div>
      </div>
    </div>
  );
};
