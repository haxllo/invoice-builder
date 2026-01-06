import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AttachmentAdd, InvoiceAdd, InvoiceItemAdd, InvoicePaymentAdd } from '@/lib/shared/types/invoice';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseInvoiceAddParams extends RequestHook<Response<InvoiceAdd>> {
  invoice?: InvoiceAdd;
}

const uploadAttachment = async (fileData: Blob | Uint8Array | undefined, fileName: string, user_id: string, bucketName: string) => {
  if (!fileData) return undefined;
  const filePath = `public/${user_id}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileData, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload ${fileName}: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  return publicUrl;
};

export const useInvoiceAdd = ({ invoice, immediate = true, showLoader = true, onDone }: UseInvoiceAddParams) => {
  const asyncFn = useCallback(async () => {
    if (!invoice) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'User not found' };

    try {
      const { invoice_items, invoice_payments, attachments, customizationWatermarkFileData, customizationPaidWatermarkFileData, ...restOfInvoice } = invoice;

      let watermarkUrl: string | undefined;
      if (customizationWatermarkFileData && invoice.customizationWatermarkFileName) {
        watermarkUrl = await uploadAttachment(customizationWatermarkFileData, invoice.customizationWatermarkFileName, user.id, 'watermarks');
      }

      let paidWatermarkUrl: string | undefined;
      if (customizationPaidWatermarkFileData && invoice.customizationPaidWatermarkFileName) {
        paidWatermarkUrl = await uploadAttachment(customizationPaidWatermarkFileData, invoice.customizationPaidWatermarkFileName, user.id, 'watermarks');
      }

      // Map InvoiceAdd to snake_case DB columns
      const dbInvoice = {
        user_id: user.id,
        invoice_type: restOfInvoice.invoiceType,
        converted_from_quotation_id: restOfInvoice.convertedFromQuotationId,
        business_id: restOfInvoice.businessId,
        client_id: restOfInvoice.clientId,
        currency_id: restOfInvoice.currencyId,
        issued_at: restOfInvoice.issuedAt,
        due_date: restOfInvoice.dueDate,
        invoice_number: restOfInvoice.invoiceNumber,
        is_archived: restOfInvoice.isArchived ? 1 : 0,
        status: restOfInvoice.status,
        customer_notes: restOfInvoice.customerNotes,
        thanks_notes: restOfInvoice.thanksNotes,
        terms_condition_notes: restOfInvoice.termsConditionNotes,
        discount_name: restOfInvoice.discountName,
        business_name_snapshot: restOfInvoice.businessNameSnapshot,
        business_short_name_snapshot: restOfInvoice.businessShortNameSnapshot,
        business_address_snapshot: restOfInvoice.businessAddressSnapshot,
        business_role_snapshot: restOfInvoice.businessRoleSnapshot,
        business_email_snapshot: restOfInvoice.businessEmailSnapshot,
        business_phone_snapshot: restOfInvoice.businessPhoneSnapshot,
        business_additional_snapshot: restOfInvoice.businessAdditionalSnapshot,
        business_payment_information_snapshot: restOfInvoice.businessPaymentInformationSnapshot,
        business_logo_snapshot: restOfInvoice.businessLogoSnapshot,
        business_file_size_snapshot: restOfInvoice.businessFileSizeSnapshot,
        business_file_type_snapshot: restOfInvoice.businessFileTypeSnapshot,
        business_file_name_snapshot: restOfInvoice.businessFileNameSnapshot,
        client_name_snapshot: restOfInvoice.clientNameSnapshot,
        client_address_snapshot: restOfInvoice.clientAddressSnapshot,
        client_email_snapshot: restOfInvoice.clientEmailSnapshot,
        client_phone_snapshot: restOfInvoice.clientPhoneSnapshot,
        client_code_snapshot: restOfInvoice.clientCodeSnapshot,
        client_additional_snapshot: restOfInvoice.clientAdditionalSnapshot,
        currency_code_snapshot: restOfInvoice.currencyCodeSnapshot,
        currency_symbol_snapshot: restOfInvoice.currencySymbolSnapshot,
        currency_subunit_snapshot: restOfInvoice.currencySubunitSnapshot,
        discount_type: restOfInvoice.discountType,
        discount_amount_cents: restOfInvoice.discountAmountCents,
        discount_percent: restOfInvoice.discountPercent,
        shipping_fee_cents: restOfInvoice.shippingFeeCents,
        invoice_prefix_snapshot: restOfInvoice.invoicePrefixSnapshot,
        invoice_suffix_snapshot: restOfInvoice.invoiceSuffixSnapshot,
        customization_color: restOfInvoice.customizationColor,
        customization_logo_size: restOfInvoice.customizationLogoSize,
        customization_font_size_size: restOfInvoice.customizationFontSizeSize,
        customization_layout: restOfInvoice.customizationLayout,
        customization_table_header_style: restOfInvoice.customizationTableHeaderStyle,
        customization_table_row_style: restOfInvoice.customizationTableRowStyle,
        customization_page_format: restOfInvoice.customizationPageFormat,
        customization_label_upper_case: restOfInvoice.customizationLabelUpperCase ? 1 : 0,
        customization_watermark_file_name: restOfInvoice.customizationWatermarkFileName,
        customization_watermark_file_type: restOfInvoice.customizationWatermarkFileType,
        customization_watermark_file_size: restOfInvoice.customizationWatermarkFileSize,
        customization_watermark_file_data: watermarkUrl,
        customization_paid_watermark_file_name: restOfInvoice.customizationPaidWatermarkFileName,
        customization_paid_watermark_file_type: restOfInvoice.customizationPaidWatermarkFileType,
        customization_paid_watermark_file_size: restOfInvoice.customizationPaidWatermarkFileSize,
        customization_paid_watermark_file_data: paidWatermarkUrl,
        tax_name: restOfInvoice.taxName,
        tax_rate: restOfInvoice.taxRate,
        tax_type: restOfInvoice.taxType
      };

      const { data: insertedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([dbInvoice])
        .select()
        .single();

      if (invoiceError) throw new Error(`Failed to add invoice: ${invoiceError.message}`);

      if (invoice_items && invoice_items.length > 0) {
        const itemsToInsert = invoice_items.map((item: InvoiceItemAdd) => ({
          parent_invoice_id: insertedInvoice.id,
          item_id: item.itemId,
          item_name_snapshot: item.itemNameSnapshot,
          unit_price_cents_snapshot: item.unitPriceCentsSnapshot,
          unit_name_snapshot: item.unitNameSnapshot,
          quantity: item.quantity,
          tax_rate: item.taxRate,
          tax_type: item.taxType
        }));
        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
        if (itemsError) throw new Error(`Failed to add invoice items: ${itemsError.message}`);
      }

      if (invoice_payments && invoice_payments.length > 0) {
        const paymentsToInsert = invoice_payments.map((payment: InvoicePaymentAdd) => ({
          parent_invoice_id: insertedInvoice.id,
          amount_cents: payment.amountCents,
          paid_at: payment.paidAt,
          payment_method: payment.paymentMethod,
          notes: payment.notes
        }));
        const { error: paymentsError } = await supabase.from('invoice_payments').insert(paymentsToInsert);
        if (paymentsError) throw new Error(`Failed to add invoice payments: ${paymentsError.message}`);
      }

      return { success: true, data: insertedInvoice };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }, [invoice]);

  const { data, loading, execute } = useAsyncAction<Response<InvoiceAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
