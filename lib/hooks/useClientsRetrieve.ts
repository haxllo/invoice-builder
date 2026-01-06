import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { Client } from '@/lib/shared/types/client';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

export const useClientsRetrieve = ({
  showLoader = true,
  immediate = true,
  filter,
  onDone
}: RequestHook<Response<Client[]>>) => {
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let query = supabase.from('clients')
      .select(`
        id,
        name,
        shortName:short_name,
        address,
        email,
        phone,
        code,
        additional,
        description,
        isArchived:is_archived,
        createdAt:created_at,
        updatedAt:updated_at
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
    return { success: true, data: data as unknown as Client[] };
  }, [filter]);

  const { data: clients, execute } = useAsyncAction<Response<Client[]>>(asyncFn, { showLoader, immediate, onDone });

  return { clients: clients?.data ?? [], execute };
};