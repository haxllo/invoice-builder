import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/lib/store/configureStore';
import { setUnitOptions } from '@/lib/store/pageSlice';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import type { Unit } from '@/lib/shared/types/unit';
import { useAsyncAction } from './useAsyncAction';

export const useUnitsRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Unit[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(async () => {
    let query = supabase.from('units')
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
    return { success: true, data: data as unknown as Unit[] };
  }, [filter]);

  const { data: units, execute, loading } = useAsyncAction<Response<Unit[]>>(asyncFn, { showLoader, onDone });

  useEffect(() => {
    if (!units || !units.data) return;

    dispatch(
      setUnitOptions(
        units.data.map(c => {
          return { label: c.name, value: c.id };
        })
      )
    );
  }, [units, dispatch]);

  return { units: units?.data ?? [], execute, loading };
};
