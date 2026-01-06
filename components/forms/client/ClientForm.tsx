'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import type { Client, ClientFromData } from '@/lib/shared/types/client';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { sanitizeString, validateEmail, validatePhone } from '@/lib/shared/utils/securityValidation';
import { User, Mail, Phone, MapPin, Hash, Info } from 'lucide-react';

// shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ClientFormProps {
  client?: Client;
  onChange?: (data: { client: ClientFromData; isValid: boolean }) => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onChange, client }) => {
  const { form, update } = useForm<ClientFromData>({
    id: client?.id,
    name: client?.name ?? '',
    shortName: client?.shortName ?? '',
    address: client?.address ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    code: client?.code ?? '',
    additional: client?.additional ?? '',
    description: client?.description ?? '',
    isArchived: client?.isArchived ?? false
  });

  const [errors, setErrors] = useState({
    email: false,
    phone: false,
    name: false,
    shortName: false
  });

  const validateField = (field: keyof typeof errors, value: string) => {
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
      !errors.name &&
      !errors.shortName;

    onChange?.({ client: form, isValid });
  }, [form, errors, onChange]);

  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Identity Section */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
              <Info size={16} />
            </div>
            <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Client Identity</h4>
          </div>
          <Separator className="mb-6" />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="client-name" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Full Name / Company Name *
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={16} />
            </div>
            <Input
              id="client-name"
              type="text"
              placeholder="e.g. John Doe or Global Tech Inc"
              className={`pl-10 ${errors.name ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}`}
              value={form.name}
              onChange={(e) => {
                update('name', e.target.value);
                validateField('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client-shortName" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Abbreviation *
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
              ID
            </div>
            <Input
              id="client-shortName"
              type="text"
              maxLength={2}
              placeholder="JD"
              className={`pl-10 ${errors.shortName ? 'border-[#f24822] text-[#f24822] placeholder-[#f24822]/50 focus-visible:ring-0 focus-visible:border-[#f24822] bg-[#fff5f5]' : ''}`}
              value={form.shortName}
              onChange={(e) => {
                update('shortName', e.target.value);
                validateField('shortName', e.target.value);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client-code" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Internal Client Code
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Hash size={16} />
            </div>
            <Input
              id="client-code"
              type="text"
              placeholder="e.g. CLI-001"
              className="pl-10"
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="md:col-span-2 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#f5f5f5] text-[#666]">
              <Mail size={16} />
            </div>
            <h4 className="text-[11px] font-semibold text-[#0d0d0d] uppercase tracking-wide">Communication Details</h4>
          </div>
          <Separator className="mb-6" />
        </div>

        <div>
          <Label htmlFor="client-email" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Email Address
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
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
          <Label htmlFor="client-phone" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Phone Number
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={16} />
            </div>
            <Input
              id="client-phone"
              type="text"
              placeholder="+1 (000) 000-0000"
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
          <Label htmlFor="client-address" className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
            Billing Address
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
              <MapPin size={16} />
            </div>
            <Textarea
              id="client-address"
              rows={3}
              placeholder="Street Address, City, State, ZIP"
              className="pl-10"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400 italic font-medium">This address will appear on invoices sent to this client.</p>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 px-5 py-4 bg-white rounded border border-[#e5e5e5] hover:border-[#999] transition-colors cursor-pointer group">
          <Checkbox
            id="isArchivedClient"
            checked={form.isArchived}
            onCheckedChange={(checked) => update('isArchived', checked === true)}
          />
          <label htmlFor="isArchivedClient" className="text-sm font-bold text-gray-700 uppercase tracking-tight cursor-pointer group-hover:text-gray-900 transition-colors">
            Archive this client
          </label>
        </div>
      </div>
    </div>
  );
};