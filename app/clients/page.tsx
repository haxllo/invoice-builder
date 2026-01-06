'use client';

import React, { useState } from 'react';
import { useClientsRetrieve } from '@/lib/hooks/useClientsRetrieve';
import { useClientAdd } from '@/lib/hooks/useClientAdd';
import { useClientUpdate } from '@/lib/hooks/useClientUpdate';
import { Client, ClientAdd, ClientUpdate } from '@/lib/shared/types/client';
import { GenericModal } from '@/components/modals/GenericModal';
import { ClientForm } from '@/components/forms/client/ClientForm';
import { Plus, User, Mail, Phone, Settings } from 'lucide-react';

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [formData, setFormData] = useState<{ client: ClientAdd; isValid: boolean } | null>(null);

  const { clients, execute: refreshClients, loading: fetching } = useClientsRetrieve({
    immediate: true,
  });

  const { execute: addClient, loading: adding } = useClientAdd({
    client: formData?.client,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-indigo-600">Invoice Builder</h1>
              <div className="flex gap-4">
                <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">Businesses</a>
                <a href="/clients" className="text-sm font-medium text-gray-900 border-b-2 border-indigo-600 pb-1">Clients</a>
                <a href="/invoices" className="text-sm font-medium text-gray-500 hover:text-gray-700">Invoices</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
            <p className="mt-1 text-sm text-gray-500 font-medium italic">Manage your professional network and contact details.</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all shadow-indigo-100"
          >
            <Plus size={18} />
            Add New Client
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <User className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Your client list is empty</p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-extrabold shadow-inner">
                          {client.shortName}
                        </div>
                        <div className="text-sm font-bold text-gray-900">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-600 font-medium">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {client.email || '--'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {client.phone || '--'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                        ${client.isArchived ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-green-700'}
                      `}>
                        {client.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(client)}
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