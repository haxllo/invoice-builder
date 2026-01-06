import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseInvoiceDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

const deleteAttachment = async (url: string | undefined | null, user_id: string, bucketName: string) => {
  if (!url) return;
  const fileName = url.split('/').pop();
  if (fileName) {
    const filePath = `public/${user_id}/${fileName}`;
    const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath]);
    if (deleteError) {
      console.error(`Failed to delete old attachment ${fileName}:`, deleteError.message);
    }
  }
};

export const useInvoiceDelete = ({ id, immediate = true, showLoader = true, onDone }: UseInvoiceDeleteParams) => {
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    try {
      // Fetch the invoice to get attachment and watermark URLs
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('customization_watermark_file_data, customization_paid_watermark_file_data, attachments(data)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch invoice for deletion: ${fetchError.message}`);

      // Delete watermark files from storage
      await deleteAttachment(invoice.customization_watermark_file_data, user.id, 'watermarks');
      await deleteAttachment(invoice.customization_paid_watermark_file_data, user.id, 'watermarks');

      // Delete attachment files from storage
      // @ts-ignore
      if (invoice.attachments && invoice.attachments.length > 0) {
        // @ts-ignore
        for (const attachment of invoice.attachments) {
          await deleteAttachment(attachment.data, user.id, 'attachments');
        }
      }

      // Delete the invoice record (cascade delete)
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw new Error(`Failed to delete invoice: ${deleteError.message}`);

      return { success: true };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }, [id]);

  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
