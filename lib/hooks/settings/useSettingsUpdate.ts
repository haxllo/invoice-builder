import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import type { SettingsUpdate } from '@/lib/shared/types/settings';
import { useAsyncAction } from '../useAsyncAction';

interface UseSettingsUpdateParams extends RequestHook<Response<SettingsUpdate>> {
  newSettings: SettingsUpdate;
}

export const useSettingsUpdate = ({
  newSettings,
  immediate = true,
  showLoader = true,
  onDone
}: UseSettingsUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<SettingsUpdate>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Map camelCase to snake_case and booleans to integers
    const dbSettings = {
      language: newSettings.language,
      amount_format: newSettings.amountFormat,
      date_format: newSettings.dateFormat,
      is_dark_mode: newSettings.isDarkMode ? 1 : 0,
      invoice_prefix: newSettings.invoicePrefix,
      invoice_suffix: newSettings.invoiceSuffix,
      should_include_year: newSettings.shouldIncludeYear ? 1 : 0,
      should_include_month: newSettings.shouldIncludeMonth ? 1 : 0,
      should_include_business_name: newSettings.shouldIncludeBusinessName ? 1 : 0,
      quotes_on: newSettings.quotesON ? 1 : 0,
      reports_on: newSettings.reportsON ? 1 : 0,
    };

    const { data, error } = await supabase
      .from('settings')
      .update(dbSettings)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data: data as unknown as SettingsUpdate };
  }, [newSettings]);

  const { data, loading, execute } = useAsyncAction<Response<SettingsUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
