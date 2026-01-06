'use client';

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  children: ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  isSaveDisabled?: boolean;
  loading?: boolean;
}

export const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isSaveDisabled = false,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaveDisabled || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
