import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseUnitDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useUnitDelete = ({ id, immediate = true, showLoader = true, onDone }: UseUnitDeleteParams) => {
  const asyncFn = useCallback(async () => {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

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
