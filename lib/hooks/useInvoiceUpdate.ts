import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AttachmentAdd, InvoiceUpdate, InvoiceItemAdd, InvoicePaymentAdd } from '@/lib/shared/types/invoice';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseInvoiceUpdateParams extends RequestHook<Response<InvoiceUpdate>> {
  invoice?: InvoiceUpdate;
}

const uploadAttachment = async (fileData: Blob | Uint8Array | undefined, fileName: string, user_id: string, bucketName: string) => {
  if (!fileData) return undefined;
  const filePath = `public/${user_id}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileData, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload ${fileName}: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  return publicUrl;
};

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

export const useInvoiceUpdate = ({ invoice, immediate = true, showLoader = true, onDone }: UseInvoiceUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<InvoiceUpdate>> => {
    if (!invoice) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    try {
      const { invoice_items, invoice_payments, attachments, customizationWatermarkFileData, customizationPaidWatermarkFileData, ...restOfInvoice } = invoice;

      // Fetch current invoice to compare attachments/watermarks
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('customization_watermark_file_data, customization_paid_watermark_file_data')
        .eq('id', invoice.id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error(`Failed to fetch current invoice: ${fetchError.message}`);

      let newWatermarkUrl = currentInvoice?.customization_watermark_file_data;
      if (customizationWatermarkFileData !== undefined) {
        if (customizationWatermarkFileData === null) {
          await deleteAttachment(currentInvoice?.customization_watermark_file_data, user.id, 'watermarks');
          newWatermarkUrl = null;
        } else if (invoice.customizationWatermarkFileName) {
          await deleteAttachment(currentInvoice?.customization_watermark_file_data, user.id, 'watermarks');
          newWatermarkUrl = await uploadAttachment(customizationWatermarkFileData, invoice.customizationWatermarkFileName, user.id, 'watermarks');
        }
      }

      let newPaidWatermarkUrl = currentInvoice?.customization_paid_watermark_file_data;
      if (customizationPaidWatermarkFileData !== undefined) {
        if (customizationPaidWatermarkFileData === null) {
          await deleteAttachment(currentInvoice?.customization_paid_watermark_file_data, user.id, 'watermarks');
          newPaidWatermarkUrl = null;
        } else if (invoice.customizationPaidWatermarkFileName) {
          await deleteAttachment(currentInvoice?.customization_paid_watermark_file_data, user.id, 'watermarks');
          newPaidWatermarkUrl = await uploadAttachment(customizationPaidWatermarkFileData, invoice.customizationPaidWatermarkFileName, user.id, 'watermarks');
        }
      }

      // Map snake_case for Update
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
            // Only update fields that changed (or all for simplicity)
            // Ideally map all fields like in add
            invoice_number: restOfInvoice.invoiceNumber,
            issued_at: restOfInvoice.issuedAt,
            due_date: restOfInvoice.dueDate,
            business_id: restOfInvoice.businessId,
            client_id: restOfInvoice.clientId,
            customer_notes: restOfInvoice.customerNotes,
            terms_condition_notes: restOfInvoice.termsConditionNotes,
            status: restOfInvoice.status,
            customization_watermark_file_data: newWatermarkUrl,
            customization_paid_watermark_file_data: newPaidWatermarkUrl
            // Add other fields as needed
        })
        .eq('id', invoice.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (invoiceError) throw new Error(`Failed to update invoice: ${invoiceError.message}`);

      // Simplistic update for related tables: delete all existing and insert new ones
      await supabase.from('invoice_items').delete().eq('parent_invoice_id', invoice.id);
      if (invoice_items && invoice_items.length > 0) {
        const itemsToInsert = invoice_items.map((item: InvoiceItemAdd) => ({
          parent_invoice_id: invoice.id,
          item_id: item.itemId,
          item_name_snapshot: item.itemNameSnapshot,
          unit_price_cents_snapshot: item.unitPriceCentsSnapshot,
          unit_name_snapshot: item.unitNameSnapshot,
          quantity: item.quantity,
          tax_rate: item.taxRate,
          tax_type: item.taxType
        }));
        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
        if (itemsError) throw new Error(`Failed to update invoice items: ${itemsError.message}`);
      }

      // ... similar for payments if needed

      return { success: true, data: updatedInvoice };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }, [invoice]);

  const { data, loading, execute } = useAsyncAction<Response<InvoiceUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
