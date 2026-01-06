'use client';

import React, { useEffect, useState } from 'react';
import { UploadImage } from '@/components/inputs/UploadImage';
import { useForm } from '@/lib/hooks/useForm';
import type { Business, BusinessFromData } from '@/lib/shared/types/business';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { sanitizeString, validateEmail, validatePhone } from '@/lib/shared/utils/securityValidation';
import { Mail, Phone, Globe, MapPin, User, Info, CreditCard } from 'lucide-react';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

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
    // Sanitize input first
    const sanitized = sanitizeString(value, 500);
    
    if (!validators.required(sanitized) && (field === 'name' || field === 'shortName')) {
      setErrors(e => ({ ...e, [field]: true }));
    } else if (field === 'email') {
      setErrors(e => ({ ...e, email: sanitized !== '' && !validateEmail(sanitized) }));
    } else if (field === 'phone') {
      setErrors(e => ({ ...e, phone: sanitized !== '' && !validatePhone(sanitized) }));
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

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center p-6 bg-[#fafafa] rounded-lg border-2 border-dashed border-[#e5e5e5]">
        <UploadImage onUpload={onUpload} imgUrl={typeof business?.logo === 'string' ? business.logo : undefined} size={80} />
        <p className="mt-3 text-[11px] font-semibold text-[#666] uppercase">Business Logo</p>
        <p className="mt-0.5 text-[11px] text-[#999]">Click to upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {/* Basic Details */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Core Identity</h4>
          </div>
          <Separator className="mb-4" />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business-name" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Legal Business Name *
          </Label>
          <div className="mt-1.5">
            <Input
              id="business-name"
              type="text"
              placeholder="e.g. Acme Corp LLC"
              className={errors.name ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value);
                validateField('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="business-shortName" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Abbreviation *
          </Label>
          <div className="mt-1.5">
            <Input
              id="business-shortName"
              type="text"
              maxLength={2}
              placeholder="AC"
              className={errors.shortName ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}
              value={form.shortName}
              onChange={(e) => {
                update('shortName', e.target.value);
                validateField('shortName', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="business-role" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Your Role
          </Label>
          <div className="mt-1.5">
            <Input
              id="business-role"
              type="text"
              placeholder="e.g. Founder, CEO"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-2 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Contact & Presence</h4>
          </div>
          <Separator className="mb-4" />
        </div>

        <div>
          <Label htmlFor="business-email" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Business Email
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <Input
              id="business-email"
              type="email"
              placeholder="hello@acme.com"
              className={`pl-10 ${errors.email ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}`}
              value={form.email}
              onChange={(e) => {
                update('email', e.target.value);
                validateField('email', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="business-phone" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Phone Number
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={16} />
            </div>
            <Input
              id="business-phone"
              type="text"
              placeholder="+1 (555) 000-0000"
              className={`pl-10 ${errors.phone ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}`}
              value={form.phone}
              onChange={(e) => {
                update('phone', e.target.value);
                validateField('phone', e.target.value);
              }}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business-website" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Website
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Globe size={16} />
            </div>
            <Input
              id="business-website"
              type="text"
              placeholder="www.acme.com"
              className="pl-10"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business-address" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Mailing Address
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
              <MapPin size={16} />
            </div>
            <Textarea
              id="business-address"
              rows={2}
              placeholder="Street, Suite, City, Country"
              className="pl-10"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
        </div>

        {/* Financial Section */}
        <div className="md:col-span-2 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
              <CreditCard size={16} />
            </div>
            <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Payment Details</h4>
          </div>
          <Separator className="mb-6" />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="business-payment" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Payment Instructions (Shown on Invoice)
          </Label>
          <div className="mt-1.5">
            <Textarea
              id="business-payment"
              rows={4}
              placeholder="Bank Name: Acme Bank&#10;IBAN: US00 0000...&#10;SWIFT: ACME123"
              value={form.paymentInformation}
              onChange={(e) => update('paymentInformation', e.target.value)}
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400 italic font-medium">This information will be displayed on your invoices for client payments.</p>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 px-5 py-4 bg-white rounded border border-[#e5e5e5] hover:border-[#999] transition-colors cursor-pointer group">
          <Checkbox
            id="isArchived"
            checked={form.isArchived}
            onCheckedChange={(checked) => update('isArchived', checked === true)}
          />
          <label htmlFor="isArchived" className="text-sm font-bold text-gray-700 uppercase tracking-tight cursor-pointer group-hover:text-gray-900 transition-colors">
            Archive this business profile
          </label>
        </div>
      </div>
    </div>
  );
};
