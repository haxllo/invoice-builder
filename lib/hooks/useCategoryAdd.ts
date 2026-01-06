import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoryAdd } from '@/lib/shared/types/category';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseCategoryAddParams extends RequestHook<Response<CategoryAdd>> {
  category?: CategoryAdd;
}

export const useCategoryAdd = ({ category, immediate = true, showLoader = true, onDone }: UseCategoryAddParams) => {
  const asyncFn = useCallback(async () => {
    if (!category) return { success: false };

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        is_archived: category.isArchived ? 1 : 0
      }])
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as CategoryAdd };
  }, [category]);

  const { data, loading, execute } = useAsyncAction<Response<CategoryAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
