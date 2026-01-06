import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ItemUpdate } from '@/lib/shared/types/item';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseItemUpdateParams extends RequestHook<Response<ItemUpdate>> {
  item?: ItemUpdate;
}

export const useItemUpdate = ({ item, immediate = true, showLoader = true, onDone }: UseItemUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<ItemUpdate>> => {
    if (!item) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    const { data, error } = await supabase
      .from('items')
      .update({
        name: item.name,
        amount: item.amount,
        unit_id: item.unitId,
        category_id: item.categoryId,
        description: item.description,
        is_archived: item.isArchived ? 1 : 0
      })
      .eq('id', item.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as ItemUpdate };
  }, [item]);

  const { data, loading, execute } = useAsyncAction<Response<ItemUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
