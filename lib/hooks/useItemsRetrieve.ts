import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { Item } from '@/lib/shared/types/item';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

export const useItemsRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Item[]>>) => {
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let query = supabase.from('items')
      .select(`
        id,
        name,
        amount,
        unitId:unit_id,
        categoryId:category_id,
        description,
        isArchived:is_archived,
        createdAt:created_at,
        updatedAt:updated_at,
        unitName:units(name)
      `)
      .eq('user_id', user.id);

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
    
    // Transform unitName from nested object to string
    const transformedData = data?.map((item: any) => ({
      ...item,
      unitName: typeof item.unitName === 'object' && item.unitName !== null 
        ? (Array.isArray(item.unitName) ? item.unitName[0]?.name : item.unitName.name) || ''
        : item.unitName || ''
    }));
    
    return { success: true, data: transformedData as unknown as Item[] };
  }, [filter]);

  const { data: items, execute, loading } = useAsyncAction<Response<Item[]>>(asyncFn, { showLoader, onDone });

  return { items: items?.data ?? [], execute, loading };
};
