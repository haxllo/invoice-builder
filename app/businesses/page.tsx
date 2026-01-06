'use client';

import React, { useState } from 'react';
import { useBusinessesRetrieve } from '@/lib/hooks/useBusinessesRetrieve';
import { useBusinessAdd } from '@/lib/hooks/useBusinessAdd';
import { useBusinessUpdate } from '@/lib/hooks/useBusinessUpdate';
import { Business, BusinessFromData, BusinessAdd, BusinessUpdate } from '@/lib/shared/types/business';
import { GenericModal } from '@/components/modals/GenericModal';
import { BusinessForm } from '@/components/forms/business/BusinessForm';
import { Plus, Briefcase, Mail, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';

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

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Businesses</h1>
            <p className="text-[13px] text-[#666]">Manage your business profiles</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={16} strokeWidth={2} />
            Add Business
          </Button>
        </div>

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-[#e5e5e5] p-12 text-center shadow-figma-sm">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase size={20} className="text-[#999]" strokeWidth={2} />
              </div>
              <p className="text-[#666] text-[13px] font-medium mb-1">No businesses found</p>
              <button
                onClick={openAddModal}
                className="mt-3 text-[#0d99ff] text-[13px] font-medium hover:underline"
              >
                Create your first business →
              </button>
            </div>
          ) : (
            businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg border border-[#e5e5e5] p-5 hover:border-[#0d99ff] transition-colors shadow-figma-sm hover:shadow-figma cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#f5f5f5] rounded flex items-center justify-center">
                    {business.logo ? (
                      <img src={typeof business.logo === "string" ? business.logo : ""} alt={business.name} className="w-full h-full object-contain rounded" />
                    ) : (
                      <Briefcase size={20} className="text-[#999]" strokeWidth={2} />
                    )}
                  </div>
                  <button
                    onClick={() => openEditModal(business)}
                    className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#0d99ff] hover:bg-[#f5f5f5] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={16} strokeWidth={2} />
                  </button>
                </div>
                
                <h3 className="text-[15px] font-semibold text-[#0d0d0d] mb-1">{business.name}</h3>
                <p className="text-[11px] text-[#999] uppercase font-medium mb-3">{business.shortName}</p>
                
                {business.email && (
                  <div className="flex items-center gap-2 text-[13px] text-[#666] mb-2">
                    <Mail size={14} strokeWidth={2} />
                    <span className="truncate">{business.email}</span>
                  </div>
                )}
                
                {business.address && (
                  <div className="flex items-start gap-2 text-[13px] text-[#666]">
                    <MapPin size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{business.address}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingBusiness ? 'Edit Business' : 'Add New Business'}
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
