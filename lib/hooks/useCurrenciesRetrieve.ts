import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { Currency } from '@/lib/shared/types/currency';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

export const useCurrenciesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Currency[]>>) => {
  const asyncFn = useCallback(async () => {
    let query = supabase.from('currencies')
      .select(`
        id,
        code,
        symbol,
        text,
        format,
        subunit,
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
    return { success: true, data: data as unknown as Currency[] };
  }, [filter]);

  const { data: currencies, execute, loading } = useAsyncAction<Response<Currency[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { currencies: currencies?.data ?? [], execute, loading };
};
