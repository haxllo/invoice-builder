'use client';

import React, { useState } from 'react';
import { useItemsRetrieve } from '@/lib/hooks/useItemsRetrieve';
import { useItemAdd } from '@/lib/hooks/useItemAdd';
import { useItemUpdate } from '@/lib/hooks/useItemUpdate';
import { Item, ItemAdd } from '@/lib/shared/types/item';
import { GenericModal } from '@/components/modals/GenericModal';
import { ItemForm } from '@/components/forms/item/ItemForm';
import { Plus, Package, DollarSign, Settings, Tag } from 'lucide-react';

export default function ItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [formData, setFormData] = useState<{ item: ItemAdd; isValid: boolean } | null>(null);

  const { items, execute: refreshItems, loading: fetching } = useItemsRetrieve({
    immediate: true,
  });

  const { execute: addItem, loading: adding } = useItemAdd({
    item: formData?.item,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshItems();
      }
    }
  });

  const { execute: updateItem, loading: updating } = useItemUpdate({
    item: formData?.item as any,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshItems();
      }
    }
  });

  const handleSave = () => {
    if (!formData?.isValid) return;
    if (editingItem) {
      updateItem();
    } else {
      addItem();
    }
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products & Services</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium italic">Define your reusable billable items for quick invoice creation.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all shadow-indigo-100"
        >
          <Plus size={18} />
          Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Default Price</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Your item catalog is empty</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-extrabold shadow-inner">
                        <Tag size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 font-medium italic line-clamp-1 max-w-xs">{item.description || 'No description provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-black text-gray-900">
                      <DollarSign size={14} className="text-gray-400 mr-0.5" />
                      {parseFloat(item.amount || '0').toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                      ${item.isArchived ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-green-700'}
                    `}>
                      {item.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(item)}
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
        title={editingItem ? 'Edit Item Details' : 'Create New Item'}
        isSaveDisabled={!formData?.isValid}
        loading={adding || updating}
      >
        <ItemForm
          item={editingItem}
          onChange={setFormData}
        />
      </GenericModal>
    </div>
  );
}