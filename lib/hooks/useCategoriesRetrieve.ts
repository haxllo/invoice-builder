import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/lib/store/configureStore';
import { setCategoryOptions } from '@/lib/store/pageSlice';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { Category } from '@/lib/shared/types/category';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

export const useCategoriesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Category[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(async () => {
    let query = supabase.from('categories')
      .select(`
        id,
        name,
        isArchived:is_archived,
        createdAt:created_at,
        updatedAt:updated_at
      `);

    if (filter) {
      filter.forEach(f => {
        if (f.type === FilterType.active) {
          query = query.eq('is_archived', 0);
        } else if (f.type === FilterType.archived) {
          query = query.eq('is_archived', 1);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data: data as unknown as Category[] };
  }, [filter]);

  const { data: categories, execute } = useAsyncAction<Response<Category[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  useEffect(() => {
    if (!categories || !categories.data) return;
    dispatch(
      setCategoryOptions(
        categories.data.map(c => {
          return { label: c.name, value: c.id };
        })
      )
    );
  }, [categories, dispatch]);

  return { categories: categories?.data ?? [], execute };
};
