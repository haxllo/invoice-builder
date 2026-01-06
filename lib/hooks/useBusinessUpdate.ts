import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BusinessUpdate } from '@/lib/shared/types/business';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseBusinessUpdateParams extends RequestHook<Response<BusinessUpdate>> {
  business?: BusinessUpdate;
}

export const useBusinessUpdate = ({
  business,
  immediate = true,
  showLoader = true,
  onDone
}: UseBusinessUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<BusinessUpdate>> => {
    if (!business) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let logoUrl: string | undefined;
    if (business.logo && business.fileName) {
      const filePath = `public/${user.id}/${business.fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, business.logo, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { success: false, message: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      logoUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from('businesses')
      .update({
        name: business.name,
        short_name: business.shortName,
        address: business.address,
        role: business.role,
        email: business.email,
        phone: business.phone,
        website: business.website,
        additional: business.additional,
        payment_information: business.paymentInformation,
        logo: logoUrl,
        file_size: business.fileSize,
        file_type: business.fileType,
        file_name: business.fileName,
        description: business.description,
        is_archived: business.isArchived ? 1 : 0
      })
      .eq('id', business.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data: data as unknown as BusinessUpdate };
  }, [business]);

  const { data, loading, execute } = useAsyncAction<Response<BusinessUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
