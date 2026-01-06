import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ClientUpdate } from '@/lib/shared/types/client';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseClientUpdateParams extends RequestHook<Response<ClientUpdate>> {
  client?: ClientUpdate;
}

export const useClientUpdate = ({ client, immediate = true, showLoader = true, onDone }: UseClientUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<ClientUpdate>> => {
    if (!client) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    const { data, error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        short_name: client.shortName,
        address: client.address,
        email: client.email,
        phone: client.phone,
        code: client.code,
        additional: client.additional,
        description: client.description,
        is_archived: client.isArchived ? 1 : 0
      })
      .eq('id', client.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as ClientUpdate };
  }, [client]);

  const { data, loading, execute } = useAsyncAction<Response<ClientUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
