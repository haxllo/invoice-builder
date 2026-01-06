'use client';

import React, { useState } from 'react';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useClientAdd } from '@/lib/hooks/useClientAdd';
import { useClientUpdate } from '@/lib/hooks/useClientUpdate';
import { Client, ClientFromData, ClientAdd, ClientUpdate } from '@/lib/shared/types/client';
import { GenericModal } from '@/components/modals/GenericModal';
import { ClientForm } from '@/components/forms/client/ClientForm';
import { Plus, Users, Mail, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [formData, setFormData] = useState<{ client: ClientFromData; isValid: boolean } | null>(null);
  
  const { user, loading: authLoading } = useAuth();

  const { clients, execute: refreshClients } = useClientsRetrieve({
    immediate: !!user,
  });

  const { execute: addClient, loading: adding } = useClientAdd({
    client: formData?.client as ClientAdd,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshClients();
      }
    }
  });

  const { execute: updateClient, loading: updating } = useClientUpdate({
    client: formData?.client as ClientUpdate,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshClients();
      }
    }
  });

  const handleSave = () => {
    if (!formData?.isValid) return;
    if (editingClient) {
      updateClient();
    } else {
      addClient();
    }
  };

  const openAddModal = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
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
            <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Clients</h1>
            <p className="text-[13px] text-[#666]">Manage your client relationships</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={16} strokeWidth={2} />
            Add Client
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-[#e5e5e5] p-12 text-center shadow-figma-sm">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-[#999]" strokeWidth={2} />
              </div>
              <p className="text-[#666] text-[13px] font-medium mb-1">No clients found</p>
              <button
                onClick={openAddModal}
                className="mt-3 text-[#0d99ff] text-[13px] font-medium hover:underline"
              >
                Add your first client →
              </button>
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg border border-[#e5e5e5] p-5 hover:border-[#0d99ff] transition-colors shadow-figma-sm hover:shadow-figma cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-[#666]">{client.shortName}</span>
                  </div>
                  <button
                    onClick={() => openEditModal(client)}
                    className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#0d99ff] hover:bg-[#f5f5f5] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={16} strokeWidth={2} />
                  </button>
                </div>
                
                <h3 className="text-[15px] font-semibold text-[#0d0d0d] mb-3">{client.name}</h3>
                
                {client.email && (
                  <div className="flex items-center gap-2 text-[13px] text-[#666] mb-2">
                    <Mail size={14} strokeWidth={2} />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start gap-2 text-[13px] text-[#666]">
                    <MapPin size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{client.address}</span>
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
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        isSaveDisabled={!formData?.isValid}
        loading={adding || updating}
      >
        <ClientForm
          client={editingClient}
          onChange={setFormData}
        />
      </GenericModal>
    </div>
  );
}
