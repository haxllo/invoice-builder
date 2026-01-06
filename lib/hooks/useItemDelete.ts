import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseItemDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useItemDelete = ({ id, immediate = true, showLoader = true, onDone }: UseItemDeleteParams) => {
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, message: error.message };
    return { success: true };
  }, [id]);

  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
