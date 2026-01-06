import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ItemAdd } from '@/lib/shared/types/item';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseItemAddParams extends RequestHook<Response<ItemAdd>> {
  item?: ItemAdd;
}

export const useItemAdd = ({ item, immediate = true, showLoader = true, onDone }: UseItemAddParams) => {
  const asyncFn = useCallback(async () => {
    if (!item) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    const { data, error } = await supabase
      .from('items')
      .insert([{
        user_id: user.id,
        name: item.name,
        amount: item.amount,
        unit_id: item.unitId,
        category_id: item.categoryId,
        description: item.description,
        is_archived: item.isArchived ? 1 : 0
      }])
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as ItemAdd };
  }, [item]);

  const { data, loading, execute } = useAsyncAction<Response<ItemAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
