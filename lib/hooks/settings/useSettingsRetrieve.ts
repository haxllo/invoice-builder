import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppDispatch } from '@/lib/store/configureStore';
import { setSettings } from '@/lib/store/pageSlice';
import type { RequestHook } from '@/lib/shared/types/requestHook';
import type { Response } from '@/lib/shared/types/response';
import type { Settings } from '@/lib/shared/types/settings';
import { useAsyncAction } from '../useAsyncAction';

export const useSettingsRetrieve = ({
  showLoader = true,
  immediate = true,
  onDone
}: RequestHook<Response<Settings>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    const { data, error } = await supabase
      .from('settings')
      .select(`
        id,
        user_id,
        language,
        amountFormat:amount_format,
        dateFormat:date_format,
        isDarkMode:is_dark_mode,
        invoicePrefix:invoice_prefix,
        invoiceSuffix:invoice_suffix,
        shouldIncludeYear:should_include_year,
        shouldIncludeMonth:should_include_month,
        shouldIncludeBusinessName:should_include_business_name,
        quotesON:quotes_on,
        reportsON:reports_on,
        createdAt:created_at,
        updatedAt:updated_at
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings found, try creating them (or handle in trigger)
      // The trigger 'on_auth_user_created' should handle this, but checking just in case.
      return { success: false, message: error.message };
    }
    
    // Map boolean integers back to booleans if needed, though Select aliases handle naming.
    // However, SQLite stored booleans as 0/1. Supabase/Postgres might return them as numbers if defined as INTEGER.
    // The schema defined them as INTEGER with check constraints. So we need to convert 1/0 to true/false.
    const settings: Settings = {
      ...data,
      isDarkMode: data.isDarkMode === 1,
      shouldIncludeYear: data.shouldIncludeYear === 1,
      shouldIncludeMonth: data.shouldIncludeMonth === 1,
      shouldIncludeBusinessName: data.shouldIncludeBusinessName === 1,
      quotesON: data.quotesON === 1,
      reportsON: data.reportsON === 1,
    } as unknown as Settings;

    return { success: true, data: settings };
  }, []);

  const {
    data: settings,
    loading,
    execute
  } = useAsyncAction<Response<Settings>>(asyncFn, { immediate, showLoader, onDone });

  useEffect(() => {
    if (!settings || !settings.data) return;
    dispatch(setSettings(settings.data));
  }, [settings, dispatch]);

  return { settings: settings?.data, loading, execute };
};
