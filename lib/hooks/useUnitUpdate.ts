import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UnitUpdate } from '@/lib/shared/types/unit';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseUnitUpdateParams extends RequestHook<Response<UnitUpdate>> {
  unit?: UnitUpdate;
}

export const useUnitUpdate = ({ unit, immediate = true, showLoader = true, onDone }: UseUnitUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<UnitUpdate>> => {
    if (!unit) return { success: false };

    const { data, error } = await supabase
      .from('units')
      .update({
        name: unit.name,
        is_archived: unit.isArchived ? 1 : 0
      })
      .eq('id', unit.id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as UnitUpdate };
  }, [unit]);

  const { data, loading, execute } = useAsyncAction<Response<UnitUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
