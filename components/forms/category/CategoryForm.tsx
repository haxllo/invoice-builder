'use client';

import React, { useEffect } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import type { Category, CategoryFromData } from '@/lib/shared/types/category';
import { Layers, Info } from 'lucide-react';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface CategoryFormProps {
  category?: Category;
  onChange?: (data: { category: CategoryFromData; isValid: boolean }) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onChange, category }) => {
  const { form, update } = useForm<CategoryFromData>({
    id: category?.id,
    name: category?.name ?? '',
    isArchived: category?.isArchived ?? false
  });

  useEffect(() => {
    const isValid = form.name.trim() !== '';
    onChange?.({ category: form, isValid });
  }, [form, onChange]);

  return (
    <div className="space-y-6 py-2">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
            <Info size={16} strokeWidth={2} />
          </div>
          <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Category Definition</h4>
        </div>
        <Separator className="mb-6" />
      </div>

      <div>
        <Label htmlFor="category-name" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
          Category Name *
        </Label>
        <div className="relative mt-1.5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Layers size={16} />
          </div>
          <Input
            id="category-name"
            type="text"
            placeholder="e.g. Services, Physical Goods"
            className="pl-10"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>
        <p className="mt-2 text-[10px] text-gray-400 italic font-medium">Used to organize your products and services in reports.</p>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-white rounded border border-[#e5e5e5] hover:border-[#999] transition-colors cursor-pointer group">
        <Checkbox
          id="isArchivedCategory"
          checked={form.isArchived}
          onCheckedChange={(checked) => update('isArchived', checked === true)}
        />
        <label htmlFor="isArchivedCategory" className="text-sm font-bold text-gray-700 uppercase tracking-tight cursor-pointer group-hover:text-gray-900 transition-colors">
          Archive this category
        </label>
      </div>
    </div>
  );
};