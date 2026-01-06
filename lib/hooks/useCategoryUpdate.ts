import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoryUpdate } from '@/lib/shared/types/category';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseCategoryUpdateParams extends RequestHook<Response<CategoryUpdate>> {
  category?: CategoryUpdate;
}

export const useCategoryUpdate = ({
  category,
  immediate = true,
  showLoader = true,
  onDone
}: UseCategoryUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<CategoryUpdate>> => {
    if (!category) return { success: false };

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        is_archived: category.isArchived ? 1 : 0
      })
      .eq('id', category.id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as CategoryUpdate };
  }, [category]);

  const { data, loading, execute } = useAsyncAction<Response<CategoryUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
