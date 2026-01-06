import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/lib/store/configureStore';
import { setBusinessSnapshotOptions, setClientSnapshotOptions } from '@/lib/store/pageSlice';
import { FilterType } from '@/lib/shared/enums/filterType';
import type { InvoiceType } from '@/lib/shared/enums/invoiceType';
import type { Invoice } from '@/lib/shared/types/invoice';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import { useAsyncAction } from './useAsyncAction';

interface UseInvoicesParams extends RequestHook<Response<Invoice[]>> {
  type?: InvoiceType;
}

export const useInvoicesRetrieve = ({
  immediate = true,
  showLoader = true,
  type,
  filter,
  onDone
}: UseInvoicesParams) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoiceType:invoice_type,
        convertedFromQuotationId:converted_from_quotation_id,
        businessId:business_id,
        clientId:client_id,
        currencyId:currency_id,
        createdAt:created_at,
        updatedAt:updated_at,
        issuedAt:issued_at,
        dueDate:due_date,
        invoiceNumber:invoice_number,
        isArchived:is_archived,
        status,
        customerNotes:customer_notes,
        thanksNotes:thanks_notes,
        termsConditionNotes:terms_condition_notes,
        discountName:discount_name,
        businessNameSnapshot:business_name_snapshot,
        businessShortNameSnapshot:business_short_name_snapshot,
        businessAddressSnapshot:business_address_snapshot,
        businessRoleSnapshot:business_role_snapshot,
        businessEmailSnapshot:business_email_snapshot,
        businessPhoneSnapshot:business_phone_snapshot,
        businessAdditionalSnapshot:business_additional_snapshot,
        businessPaymentInformationSnapshot:business_payment_information_snapshot,
        businessLogoSnapshot:business_logo_snapshot,
        businessFileSizeSnapshot:business_file_size_snapshot,
        businessFileTypeSnapshot:business_file_type_snapshot,
        businessFileNameSnapshot:business_file_name_snapshot,
        clientNameSnapshot:client_name_snapshot,
        clientAddressSnapshot:client_address_snapshot,
        clientEmailSnapshot:client_email_snapshot,
        clientPhoneSnapshot:client_phone_snapshot,
        clientCodeSnapshot:client_code_snapshot,
        clientAdditionalSnapshot:client_additional_snapshot,
        currencyCodeSnapshot:currency_code_snapshot,
        currencySymbolSnapshot:currency_symbol_snapshot,
        currencySubunitSnapshot:currency_subunit_snapshot,
        discountType:discount_type,
        discountAmountCents:discount_amount_cents,
        discountPercent:discount_percent,
        shippingFeeCents:shipping_fee_cents,
        invoicePrefixSnapshot:invoice_prefix_snapshot,
        invoiceSuffixSnapshot:invoice_suffix_snapshot,
        customizationColor:customization_color,
        customizationLogoSize:customization_logo_size,
        customizationFontSizeSize:customization_font_size_size,
        customizationLayout:customization_layout,
        customizationTableHeaderStyle:customization_table_header_style,
        customizationTableRowStyle:customization_table_row_style,
        customizationPageFormat:customization_page_format,
        customizationLabelUpperCase:customization_label_upper_case,
        customizationWatermarkFileName:customization_watermark_file_name,
        customizationWatermarkFileType:customization_watermark_file_type,
        customizationWatermarkFileSize:customization_watermark_file_size,
        customizationWatermarkFileData:customization_watermark_file_data,
        customizationPaidWatermarkFileName:customization_paid_watermark_file_name,
        customizationPaidWatermarkFileType:customization_paid_watermark_file_type,
        customizationPaidWatermarkFileSize:customization_paid_watermark_file_size,
        customizationPaidWatermarkFileData:customization_paid_watermark_file_data,
        taxName:tax_name,
        taxRate:tax_rate,
        taxType:tax_type,
        invoice_items (
          id,
          parentInvoiceId:parent_invoice_id,
          itemId:item_id,
          itemNameSnapshot:item_name_snapshot,
          unitPriceCentsSnapshot:unit_price_cents_snapshot,
          unitNameSnapshot:unit_name_snapshot,
          quantity,
          taxRate:tax_rate,
          taxType:tax_type,
          createdAt:created_at,
          updatedAt:updated_at
        ),
        invoice_payments (
          id,
          parentInvoiceId:parent_invoice_id,
          amountCents:amount_cents,
          paidAt:paid_at,
          paymentMethod:payment_method,
          notes,
          createdAt:created_at,
          updatedAt:updated_at
        ),
        attachments (
          id,
          parentInvoiceId:parent_invoice_id,
          fileName:file_name,
          fileType:file_type,
          fileSize:file_size,
          data,
          createdAt:created_at,
          updatedAt:updated_at
        )
      `)
      .eq('user_id', user.id);

    if (type) {
      query = query.eq('invoice_type', type);
    }

    if (filter) {
      filter.forEach(f => {
        if (f.type === FilterType.active) {
          query = query.eq('is_archived', 0);
        } else if (f.type === FilterType.archived) {
          query = query.eq('is_archived', 1);
        } else if (f.type === FilterType.status && f.value) {
          query = query.eq('status', f.value);
        } else if (f.type === FilterType.client && f.value) {
          query = query.eq('client_id', parseInt(f.value));
        } else if (f.type === FilterType.business && f.value) {
          query = query.eq('business_id', parseInt(f.value));
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data: data as unknown as Invoice[] };
  }, [filter, type, dispatch]);

  const { data: invoices, execute } = useAsyncAction<Response<Invoice[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  useEffect(() => {
    if (!invoices || !invoices.data) return;

    const uniqueBusinessSnapshots = [...new Set(invoices.data.map(c => c.businessNameSnapshot))];
    dispatch(
      setBusinessSnapshotOptions(
        uniqueBusinessSnapshots.map(c => {
          return { label: c, value: c };
        })
      )
    );

    const uniqueClientsSnapshots = [...new Set(invoices.data.map(c => c.clientNameSnapshot))];
    dispatch(
      setClientSnapshotOptions(
        uniqueClientsSnapshots.map(c => {
          return { label: c, value: c };
        })
      )
    );
  }, [invoices, dispatch]);

  return { invoices: invoices?.data ?? [], execute };
};