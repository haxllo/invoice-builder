'use client';

import React, { useEffect } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import type { Unit, UnitFromData } from '@/lib/shared/types/unit';
import { Ruler, Info } from 'lucide-react';

interface UnitFormProps {
  unit?: Unit;
  onChange?: (data: { unit: UnitFromData; isValid: boolean }) => void;
}

export const UnitForm: React.FC<UnitFormProps> = ({ onChange, unit }) => {
  const { form, update } = useForm<UnitFromData>({
    id: unit?.id,
    name: unit?.name ?? '',
    isArchived: unit?.isArchived ?? false
  });

  useEffect(() => {
    const isValid = form.name.trim() !== '';
    onChange?.({ unit: form, isValid });
  }, [form, onChange]);

  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";
  const inputClasses = "block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all";

  return (
    <div className="space-y-6 py-2">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
          <Info size={16} className="text-indigo-600" />
          Unit Specification
        </h4>
      </div>

      <div>
        <label className={labelClasses}>Unit Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Ruler size={16} />
          </div>
          <input
            type="text"
            placeholder="e.g. hours, pcs, kg"
            className={inputClasses}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
        <p className="mt-2 text-[10px] text-gray-400 italic font-medium">This will appear on invoice line items (e.g. 5 **hrs**).</p>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
        <input
          id="isArchivedUnit"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={form.isArchived}
          onChange={(e) => update('isArchived', e.target.checked)}
        />
        <label htmlFor="isArchivedUnit" className="text-xs font-bold text-gray-700 uppercase tracking-tight">
          Archive this unit
        </label>
      </div>
    </div>
  );
};