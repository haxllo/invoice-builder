'use client';

import React, { useState } from 'react';
import { useItemsRetrieve } from '@/lib/hooks/useItemsRetrieve';
import { useItemAdd } from '@/lib/hooks/useItemAdd';
import { useItemUpdate } from '@/lib/hooks/useItemUpdate';
import { Item, ItemFromData, ItemAdd, ItemUpdate } from '@/lib/shared/types/item';
import { GenericModal } from '@/components/modals/GenericModal';
import { ItemForm } from '@/components/forms/item/ItemForm';
import { Plus, Package, DollarSign, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

import { Button } from '@/components/ui/button';
export default function ItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [formData, setFormData] = useState<{ item: ItemFromData; isValid: boolean } | null>(null);
  
  const { user, loading: authLoading } = useAuth();

  const { items, execute: refreshItems } = useItemsRetrieve({
    immediate: !!user,
  });

  const { execute: addItem, loading: adding } = useItemAdd({
    item: formData?.item as ItemAdd,
    immediate: false,
    onDone: (res) => {
      if (res.success) {
        setIsModalOpen(false);
        refreshItems();
      }
    }
  });

  const { execute: updateItem, loading: updating } = useItemUpdate({
    item: formData?.item as ItemUpdate,
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

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0d0d0d] mb-1">Items Catalog</h1>
            <p className="text-[13px] text-[#666]">Products and services you offer</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={16} strokeWidth={2} />
            Add Item
          </Button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-[#e5e5e5] p-12 text-center shadow-figma-sm">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={20} className="text-[#999]" strokeWidth={2} />
              </div>
              <p className="text-[#666] text-[13px] font-medium mb-1">No items found</p>
              <button
                onClick={openAddModal}
                className="mt-3 text-[#0d99ff] text-[13px] font-medium hover:underline"
              >
                Add your first item →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-[#e5e5e5] p-5 hover:border-[#0d99ff] transition-colors shadow-figma-sm hover:shadow-figma cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded flex items-center justify-center">
                    <Package size={18} className="text-[#666]" strokeWidth={2} />
                  </div>
                  <button
                    onClick={() => openEditModal(item)}
                    className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#0d99ff] hover:bg-[#f5f5f5] rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={16} strokeWidth={2} />
                  </button>
                </div>
                
                <h3 className="text-[15px] font-semibold text-[#0d0d0d] mb-2">{item.name}</h3>
                
                <div className="flex items-center gap-2 text-[15px] font-semibold text-[#0d99ff]">
                  <DollarSign size={14} strokeWidth={2} />
                  <span>{parseFloat(item.amount || "0").toFixed(2)}</span>
                </div>
                
                {item.description && (
                  <p className="text-[13px] text-[#666] mt-3 line-clamp-2">{item.description}</p>
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
        title={editingItem ? 'Edit Item' : 'Add New Item'}
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
