'use client';

import React, { useEffect, useState } from 'react';
import { UploadImage } from '@/components/inputs/UploadImage';
import { useForm } from '@/lib/hooks/useForm';
import type { Business, BusinessFromData } from '@/lib/shared/types/business';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { Mail, Phone, Globe, MapPin, User, Info, CreditCard } from 'lucide-react';

interface BusinessFormProps {
  business?: Business;
  onChange?: (data: { business: BusinessFromData; isValid: boolean }) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ onChange, business }) => {
  const { form, setForm, update } = useForm<BusinessFromData>({
    id: business?.id,
    logo: undefined,
    email: business?.email ?? '',
    phone: business?.phone ?? '',
    name: business?.name ?? '',
    shortName: business?.shortName ?? '',
    role: business?.role ?? '',
    address: business?.address ?? '',
    website: business?.website ?? '',
    additional: business?.additional ?? '',
    paymentInformation: business?.paymentInformation ?? '',
    description: business?.description ?? '',
    isArchived: business?.isArchived ?? false
  });

  const [errors, setErrors] = useState({
    email: false,
    phone: false,
    name: false,
    shortName: false
  });

  const validateField = (field: keyof typeof errors, value: string) => {
    if (!validators.required(value) && (field === 'name' || field === 'shortName')) {
      setErrors(e => ({ ...e, [field]: true }));
    } else if (field === 'email') {
      setErrors(e => ({ ...e, email: value !== '' && !validators.email(value) }));
    } else {
      setErrors(e => ({ ...e, [field]: false }));
    }
  };

  useEffect(() => {
    const isValid =
      form.name.trim() !== '' &&
      form.shortName.trim() !== '' &&
      !errors.email &&
      !errors.phone &&
      !errors.name &&
      !errors.shortName;

    onChange?.({ business: form, isValid });
  }, [form, errors, onChange]);

  const onUpload = (file?: Blob, filename?: string) => {
    if (file) {
      update('logo', file as any);
      update('fileName', filename);
      update('fileSize', file.size);
      update('fileType', file.type);
    } else {
      update('logo', undefined);
      update('fileName', undefined);
    }
  };

  const inputClasses = (hasError: boolean) => `
    block w-full pl-10 pr-3 py-2 border rounded-lg text-sm transition-all
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400'}
  `;

  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  return (
    <div className="space-y-8 py-2">
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <UploadImage onUpload={onUpload} imgUrl={typeof business?.logo === 'string' ? business.logo : undefined} size={100} />
        <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Business Logo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Basic Details */}
        <div className="md:col-span-2">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Info size={16} className="text-indigo-600" />
            Core Identity
          </h4>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Legal Business Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={16} />
            </div>
            <input
              type="text"
              placeholder="e.g. Acme Corp LLC"
              className={inputClasses(errors.name)}
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value);
                validateField('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Abbreviation *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs uppercase">
              ID
            </div>
            <input
              type="text"
              maxLength={2}
              placeholder="AC"
              className={inputClasses(errors.shortName)}
              value={form.shortName}
              onChange={(e) => {
                update('shortName', e.target.value);
                validateField('shortName', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Your Role</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Briefcase size={16} xmlns="http://www.w3.org/2000/svg" />
            </div>
            <input
              type="text"
              placeholder="e.g. Founder, CEO"
              className={inputClasses(false)}
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-2 pt-4">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Mail size={16} className="text-indigo-600" />
            Contact & Presence
          </h4>
        </div>

        <div>
          <label className={labelClasses}>Business Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              placeholder="hello@acme.com"
              className={inputClasses(errors.email)}
              value={form.email}
              onChange={(e) => {
                update('email', e.target.value);
                validateField('email', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={16} />
            </div>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className={inputClasses(false)}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Website</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Globe size={16} />
            </div>
            <input
              type="text"
              placeholder="www.acme.com"
              className={inputClasses(false)}
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Mailing Address</label>
          <div className="relative">
            <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
              <MapPin size={16} />
            </div>
            <textarea
              rows={2}
              placeholder="Street, Suite, City, Country"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
        </div>

        {/* Financial Section */}
        <div className="md:col-span-2 pt-4">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <CreditCard size={16} className="text-indigo-600" />
            Payment Details
          </h4>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Payment Instructions (Shown on Invoice)</label>
          <textarea
            rows={3}
            placeholder="Bank Name: Acme Bank\nIBAN: US00 0000..."
            className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
            value={form.paymentInformation}
            onChange={(e) => update('paymentInformation', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2 px-1 py-4 bg-gray-50 rounded-lg border border-gray-100">
          <input
            id="isArchived"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-4"
            checked={form.isArchived}
            onChange={(e) => update('isArchived', e.target.checked)}
          />
          <label htmlFor="isArchived" className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            Archive this business profile
          </label>
        </div>
      </div>
    </div>
  );
};
import { Briefcase } from 'lucide-react';
