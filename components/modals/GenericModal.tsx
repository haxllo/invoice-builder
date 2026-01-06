'use client';

import React, { ReactNode, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg border border-[#e5e5e5] shadow-figma-lg overflow-hidden flex flex-col max-h-[85vh] animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#e5e5e5]">
          <h3 className="text-[13px] font-semibold text-[#0d0d0d]">{title}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#f5f5f5] text-[#666] hover:text-[#0d0d0d] transition-colors"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 h-14 items-center border-t border-[#e5e5e5] bg-[#fafafa]">
          <button
            onClick={onClose}
            className="h-8 px-3 text-[13px] font-medium text-[#0d0d0d] rounded hover:bg-[#f0f0f0] transition-colors"
          >
            {cancelLabel}
          </button>
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaveDisabled || loading}
              className="h-8 px-3 text-[13px] font-medium text-white bg-[#0d99ff] rounded hover:bg-[#0c8ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving...' : saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
