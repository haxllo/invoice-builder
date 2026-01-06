'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import { useUnitsRetrieve } from '@/lib/hooks/useUnitsRetrieve';
import { useCategoriesRetrieve } from '@/lib/hooks/useCategoriesRetrieve';
import type { Item, ItemFromData } from '@/lib/shared/types/item';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { validateFinancialAmount } from '@/lib/shared/utils/securityValidation';
import { Package, DollarSign, Layers, Ruler, FileText, Info } from 'lucide-react';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ItemFormProps {
  item?: Item;
  onChange?: (data: { item: ItemFromData; isValid: boolean }) => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onChange, item }) => {
  const { units } = useUnitsRetrieve({ immediate: true });
  const { categories } = useCategoriesRetrieve({ immediate: true });

  const { form, update } = useForm<ItemFromData>({
    id: item?.id,
    name: item?.name ?? '',
    amount: item?.amount ?? '0',
    unitId: item?.unitId ?? 0,
    categoryId: item?.categoryId ?? 0,
    description: item?.description ?? '',
    isArchived: item?.isArchived ?? false
  });

  const [errors, setErrors] = useState({
    name: false,
    amount: false
  });
  
  const [validationError, setValidationError] = useState<string>('');

  const validateField = (field: keyof typeof errors, value: string) => {
    if (!validators.required(value)) {
      setErrors(e => ({ ...e, [field]: true }));
    } else {
      setErrors(e => ({ ...e, [field]: false }));
    }
  };

  useEffect(() => {
    const isValid = form.name.trim() !== '' && !errors.name;
    onChange?.({ item: form, isValid });
  }, [form, errors, onChange]);

  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Item Core Info */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
              <Info size={16} strokeWidth={2} />
            </div>
            <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Product Details</h4>
          </div>
          <Separator className="mb-6" />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="item-name" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Item Name *
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Package size={16} strokeWidth={2} />
            </div>
            <Input
              id="item-name"
              type="text"
              placeholder="e.g. Logo Design, Consulting, etc."
              className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value);
                validateField('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="item-amount" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Default Price / Amount
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <DollarSign size={16} strokeWidth={2} />
            </div>
            <Input
              id="item-amount"
              type="number"
              placeholder="0.00"
              className={`pl-10 ${errors.amount ? 'border-destructive' : ''}`}
              value={form.amount}
              onChange={(e) => {
                try {
                  setValidationError('');
                  setErrors(er => ({ ...er, amount: false }));
                  const validated = validateFinancialAmount(e.target.value, 'Amount');
                  update('amount', validated.toString());
                } catch (error: any) {
                  setValidationError(error.message);
                  setErrors(er => ({ ...er, amount: true }));
                  update('amount', e.target.value);
                }
              }}
            />
          </div>
          {validationError && errors.amount && (
            <p className="mt-1.5 text-xs text-destructive font-medium">{validationError}</p>
          )}
        </div>

        {/* Classification */}
        <div className="md:col-span-2 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
              <Layers size={16} strokeWidth={2} />
            </div>
            <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Classification</h4>
          </div>
          <Separator className="mb-6" />
        </div>

        <div>
          <Label htmlFor="item-unit" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Unit of Measure
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground z-10">
              <Ruler size={16} strokeWidth={2} />
            </div>
            <Select value={String(form.unitId)} onValueChange={(v) => update('unitId', Number(v))}>
              <SelectTrigger id="item-unit" className="pl-10">
                <SelectValue placeholder="No Unit Selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Unit Selected</SelectItem>
                {units.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="item-category" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Category
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground z-10">
              <Layers size={16} strokeWidth={2} />
            </div>
            <Select value={String(form.categoryId)} onValueChange={(v) => update('categoryId', Number(v))}>
              <SelectTrigger id="item-category" className="pl-10">
                <SelectValue placeholder="No Category Selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Category Selected</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="item-description" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Description
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
              <FileText size={16} strokeWidth={2} />
            </div>
            <Textarea
              id="item-description"
              rows={3}
              placeholder="Provide a detailed description of this item or service..."
              className="pl-10 resize-none"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground italic">This description will appear on invoice line items.</p>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 px-5 py-4 bg-card rounded border border-border hover:border-muted-foreground transition-colors">
          <Checkbox
            id="isArchivedItem"
            checked={form.isArchived}
            onCheckedChange={(checked) => update('isArchived', checked as boolean)}
          />
          <Label 
            htmlFor="isArchivedItem" 
            className="text-[13px] font-semibold text-foreground cursor-pointer select-none"
          >
            Archive this item (hidden from invoice selection)
          </Label>
        </div>
      </div>
    </div>
  );
};