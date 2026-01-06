'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import { useUnitsRetrieve } from '@/lib/hooks/useUnitsRetrieve';
import { useCategoriesRetrieve } from '@/lib/hooks/useCategoriesRetrieve';
import type { Item, ItemAdd } from '@/lib/shared/types/item';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { Package, DollarSign, Layers, Ruler, FileText, Info } from 'lucide-react';

interface ItemFormProps {
  item?: Item;
  onChange?: (data: { item: ItemAdd; isValid: boolean }) => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onChange, item }) => {
  const { units } = useUnitsRetrieve({ immediate: true });
  const { categories } = useCategoriesRetrieve({ immediate: true });

  const { form, update } = useForm<ItemAdd>({
    id: item?.id as any,
    name: item?.name ?? '',
    amount: item?.amount ?? '0',
    unitId: item?.unitId ?? 0,
    categoryId: item?.categoryId ?? 0,
    description: item?.description ?? '',
    isArchived: item?.isArchived ?? false
  });

  const [errors, setErrors] = useState({
    name: false
  });

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

  const inputClasses = (hasError: boolean) => `
    block w-full pl-10 pr-3 py-2 border rounded-lg text-sm transition-all
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400'}
  `;

  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Item Core Info */}
        <div className="md:col-span-2">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Info size={16} className="text-indigo-600" />
            Product Details
          </h4>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Item Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Package size={16} />
            </div>
            <input
              type="text"
              placeholder="e.g. Logo Design, Consulting, etc."
              className={inputClasses(errors.name)}
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value);
                validateField('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Default Price / Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <DollarSign size={16} />
            </div>
            <input
              type="number"
              placeholder="0.00"
              className={inputClasses(false)}
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
            />
          </div>
        </div>

        {/* Classification */}
        <div className="md:col-span-2 pt-4">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Layers size={16} className="text-indigo-600" />
            Classification
          </h4>
        </div>

        <div>
          <label className={labelClasses}>Unit of Measure</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Ruler size={16} />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={form.unitId}
              onChange={(e) => update('unitId', Number(e.target.value))}
            >
              <option value={0}>No Unit Selected</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Category</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Layers size={16} />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={form.categoryId}
              onChange={(e) => update('categoryId', Number(e.target.value))}
            >
              <option value={0}>No Category Selected</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Description</label>
          <div className="relative">
            <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
              <FileText size={16} />
            </div>
            <textarea
              rows={3}
              placeholder="Provide a detailed description of this item or service..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2 px-1 py-4 bg-gray-50 rounded-lg border border-gray-100">
          <input
            id="isArchivedItem"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-4"
            checked={form.isArchived}
            onChange={(e) => update('isArchived', e.target.checked)}
          />
          <label htmlFor="isArchivedItem" className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            Archive this item (hidden from invoice selection)
          </label>
        </div>
      </div>
    </div>
  );
};
