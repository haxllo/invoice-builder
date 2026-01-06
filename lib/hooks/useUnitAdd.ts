import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UnitAdd } from '@/lib/shared/types/unit';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseUnitAddParams extends RequestHook<Response<UnitAdd>> {
  unit?: UnitAdd;
}

export const useUnitAdd = ({ unit, immediate = true, showLoader = true, onDone }: UseUnitAddParams) => {
  const asyncFn = useCallback(async () => {
    if (!unit) return { success: false };

    const { data, error } = await supabase
      .from('units')
      .insert([{
        name: unit.name,
        is_archived: unit.isArchived ? 1 : 0
      }])
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as UnitAdd };
  }, [unit]);

  const { data, loading, execute } = useAsyncAction<Response<UnitAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
