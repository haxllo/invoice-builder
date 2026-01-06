import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ClientAdd } from '@/lib/shared/types/client';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseClientAddParams extends RequestHook<Response<ClientAdd>> {
  client?: ClientAdd;
}

export const useClientAdd = ({ client, immediate = true, showLoader = true, onDone }: UseClientAddParams) => {
  const asyncFn = useCallback(async () => {
    if (!client) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id: user.id,
        name: client.name,
        short_name: client.shortName,
        address: client.address,
        email: client.email,
        phone: client.phone,
        code: client.code,
        additional: client.additional,
        description: client.description,
        is_archived: client.isArchived ? 1 : 0
      }])
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as unknown as ClientAdd };
  }, [client]);

  const { data, loading, execute } = useAsyncAction<Response<ClientAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
