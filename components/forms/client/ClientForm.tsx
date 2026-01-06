'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from '@/lib/hooks/useForm';
import type { Client, ClientFromData } from '@/lib/shared/types/client';
import { validators } from '@/lib/shared/utils/validatorFunctions';
import { User, Mail, Phone, MapPin, Hash, Info } from 'lucide-react';

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
      !errors.name &&
      !errors.shortName;

    onChange?.({ client: form, isValid });
  }, [form, errors, onChange]);

  const inputClasses = (hasError: boolean) => `
    block w-full pl-10 pr-3 py-2 border rounded-lg text-sm transition-all
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400'}
  `;

  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Identity Section */}
        <div className="md:col-span-2">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Info size={16} className="text-indigo-600" />
            Client Identity
          </h4>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Full Name / Company Name *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={16} />
            </div>
            <input
              type="text"
              placeholder="e.g. John Doe or Global Tech Inc"
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
              ID
            </div>
            <input
              type="text"
              maxLength={2}
              placeholder="JD"
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
          <label className={labelClasses}>Internal Client Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Hash size={16} />
            </div>
            <input
              type="text"
              placeholder="e.g. CLI-001"
              className={inputClasses(false)}
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="md:col-span-2 pt-4">
          <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
            <Mail size={16} className="text-indigo-600" />
            Communication Details
          </h4>
        </div>

        <div>
          <label className={labelClasses}>Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              placeholder="client@example.com"
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
              placeholder="+1 (000) 000-0000"
              className={inputClasses(false)}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Billing Address</label>
          <div className="relative">
            <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
              <MapPin size={16} />
            </div>
            <textarea
              rows={2}
              placeholder="Street Address, City, State, ZIP"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-all"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2 px-1 py-4 bg-gray-50 rounded-lg border border-gray-100">
          <input
            id="isArchivedClient"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-4"
            checked={form.isArchived}
            onChange={(e) => update('isArchived', e.target.checked)}
          />
          <label htmlFor="isArchivedClient" className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            Archive this client
          </label>
        </div>
      </div>
    </div>
  );
};