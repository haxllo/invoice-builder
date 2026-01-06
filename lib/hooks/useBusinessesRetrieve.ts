import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { Business } from '@/lib/shared/types/business';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

export const useBusinessesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Business[]>>) => {
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let query = supabase.from('businesses')
      .select(`
        id,
        name,
        shortName:short_name,
        address,
        role,
        email,
        phone,
        website,
        additional,
        paymentInformation:payment_information,
        logo,
        fileSize:file_size,
        fileType:file_type,
        fileName:file_name,
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
    return { success: true, data: data as unknown as Business[] };
  }, [filter]);

  const { data: businesses, execute } = useAsyncAction<Response<Business[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { businesses: businesses?.data ?? [], execute };
};