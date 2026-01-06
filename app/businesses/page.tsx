'use client';

import React, { useState } from 'react';
import { useBusinessesRetrieve } from '@/lib/hooks/useBusinessesRetrieve';
import { useBusinessAdd } from '@/lib/hooks/useBusinessAdd';
import { useBusinessUpdate } from '@/lib/hooks/useBusinessUpdate';
import { Business, BusinessFromData, BusinessAdd, BusinessUpdate } from '@/lib/shared/types/business';
import { GenericModal } from '@/components/modals/GenericModal';
import { BusinessForm } from '@/components/forms/business/BusinessForm';
import { Plus, Briefcase, Mail, MapPin, Settings } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function BusinessesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | undefined>(undefined);
  const [formData, setFormData] = useState<{ business: BusinessFromData; isValid: boolean } | null>(null);
  
  const { user, loading: authLoading } = useAuth();

  const { businesses, execute: refreshBusinesses } = useBusinessesRetrieve({
    immediate: !!user,
  });

  const { execute: addBusiness, loading: adding } = useBusinessAdd({
    business: formData?.business as BusinessAdd,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshBusinesses();
      }
    }
  });

  const { execute: updateBusiness, loading: updating } = useBusinessUpdate({
    business: formData?.business as BusinessUpdate,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshBusinesses();
      }
    }
  });

  const handleSave = () => {
    if (!formData?.isValid) return;
    if (editingBusiness) {
      updateBusiness();
    } else {
      addBusiness();
    }
  };

  const openAddModal = () => {
    setEditingBusiness(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (business: Business) => {
    setEditingBusiness(business);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center font-medium text-gray-600">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Businesses</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium italic">Manage your legal entities and branding profiles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all shadow-indigo-100"
        >
          <Plus size={18} />
          Add Business
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact & Address</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {businesses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No business profiles created yet</p>
                </td>
              </tr>
            ) : (
              businesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {business.logo ? (
                        <img src={business.logo as any} alt={business.name} className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm border border-gray-100" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-extrabold shadow-inner">
                          {business.shortName}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-gray-900">{business.name}</div>
                        <div className="text-xs text-gray-500 font-medium italic">{business.role || 'Primary Entity'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {business.email || '--'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 truncate max-w-xs">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        {business.address || '--'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                      ${business.isArchived ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-green-700'}
                    `}>
                      {business.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(business)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingBusiness ? 'Edit Business Profile' : 'Create Business Profile'}
        isSaveDisabled={!formData?.isValid}
        loading={adding || updating}
      >
        <BusinessForm
          business={editingBusiness}
          onChange={setFormData}
        />
      </GenericModal>
    </div>
  );
}
