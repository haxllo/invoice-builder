'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsRetrieve } from '@/lib/hooks/settings/useSettingsRetrieve';
import { useSettingsUpdate } from '@/lib/hooks/settings/useSettingsUpdate';
import { SettingsUpdate } from '@/lib/shared/types/settings';
import { 
  Save, 
  Settings as SettingsIcon, 
  Globe, 
  Calendar, 
  Type, 
  Eye, 
  Database,
  Hash,
  Layout,
  Clock,
  FileText
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, loading: fetching } = useSettingsRetrieve({ immediate: true });
  const [formData, setFormData] = useState<SettingsUpdate | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        language: settings.language,
        amountFormat: settings.amountFormat,
        dateFormat: settings.dateFormat,
        isDarkMode: settings.isDarkMode,
        invoicePrefix: settings.invoicePrefix,
        invoiceSuffix: settings.invoiceSuffix,
        shouldIncludeYear: settings.shouldIncludeYear,
        shouldIncludeMonth: settings.shouldIncludeMonth,
        shouldIncludeBusinessName: settings.shouldIncludeBusinessName,
        quotesON: settings.quotesON,
        reportsON: settings.reportsON,
      });
    }
  }, [settings]);

  const { execute: updateSettings, loading: updating } = useSettingsUpdate({
    newSettings: formData as any,
    immediate: false,
    onDone: (res) => {
      if (res.success) alert('Settings saved successfully!');
    }
  });

  const handleChange = (field: keyof SettingsUpdate, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (fetching || !formData) {
    return <div className="flex h-screen items-center justify-center font-medium text-gray-500 italic">Loading configuration...</div>;
  }

  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";
  const inputClasses = "block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all";
  const sectionHeaderClasses = "flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-6";

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <SettingsIcon className="text-indigo-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium italic pl-10">Configure your global preferences and document defaults.</p>
        </div>
        <button
          onClick={() => updateSettings()}
          disabled={updating}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-12">
        {/* Localization */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h4 className={sectionHeaderClasses}>
            <Globe size={16} className="text-indigo-600" />
            Regional & Display
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClasses}>Primary Language</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Type size={16} />
                </div>
                <select
                  className={inputClasses}
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="en">English (US)</option>
                  <option value="lt">Lithuanian (LT)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Preferred Date Format</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={16} />
                </div>
                <select
                  className={inputClasses}
                  value={formData.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <option value="MM/dd/yyyy">MM / DD / YYYY</option>
                  <option value="dd/MM/yyyy">DD / MM / YYYY</option>
                  <option value="yyyy-MM-dd">YYYY - MM - DD</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 border border-gray-100">
                    <Eye size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Dark Mode Interface</p>
                    <p className="text-xs text-gray-500 font-medium">Toggle between light and dark visual themes.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  checked={formData.isDarkMode}
                  onChange={(e) => handleChange('isDarkMode', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Invoice Numbering */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h4 className={sectionHeaderClasses}>
            <Hash size={16} className="text-indigo-600" />
            Document Numbering
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClasses}>Global Prefix</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs uppercase">
                  Pre
                </div>
                <input
                  type="text"
                  placeholder="e.g. INV-"
                  className={inputClasses}
                  value={formData.invoicePrefix || ''}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Global Suffix</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs uppercase">
                  Suf
                </div>
                <input
                  type="text"
                  placeholder="e.g. /HQ"
                  className={inputClasses}
                  value={formData.invoiceSuffix || ''}
                  onChange={(e) => handleChange('invoiceSuffix', e.target.value)}
                />
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Include Year in Number</span>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  checked={formData.shouldIncludeYear}
                  onChange={(e) => handleChange('shouldIncludeYear', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Include Month in Number</span>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  checked={formData.shouldIncludeMonth}
                  onChange={(e) => handleChange('shouldIncludeMonth', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h4 className={sectionHeaderClasses}>
            <Layout size={16} className="text-indigo-600" />
            Module Configuration
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">Enable Quotes System</p>
                  <p className="text-xs text-indigo-600 font-medium italic">Allow creation of estimates and proposals.</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded cursor-pointer"
                checked={formData.quotesON}
                onChange={(e) => handleChange('quotesON', e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">Enable Reports Engine</p>
                  <p className="text-xs text-indigo-600 font-medium italic">Generate business performance insights.</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded cursor-pointer"
                checked={formData.reportsON}
                onChange={(e) => handleChange('reportsON', e.target.checked)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
