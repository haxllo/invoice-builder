'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/configureStore';
import { addToast } from '@/lib/store/pageSlice';

interface UploadImageProps {
  onUpload?: (file?: Blob, filename?: string) => void;
  size?: number;
  maxSizeMB?: number;
  imgUrl?: string;
  disabled?: boolean;
}

export const UploadImage: React.FC<UploadImageProps> = ({
  onUpload,
  size = 120,
  maxSizeMB = 2,
  imgUrl,
  disabled
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [previewUrl, setCroppedImageUrl] = useState<string | undefined>(imgUrl);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      event.target.value = '';
      dispatch(addToast({ message: `File too large. Max size is ${maxSizeMB}MB`, severity: 'error' }));
    } else {
      const url = URL.createObjectURL(file);
      setCroppedImageUrl(url);
      if (onUpload) onUpload(file, file.name);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCroppedImageUrl(undefined);
    if (inputRef.current) inputRef.current.value = '';
    if (onUpload) onUpload(undefined);
  };

  useEffect(() => {
    setCroppedImageUrl(imgUrl);
  }, [imgUrl]);

  return (
    <div className="relative inline-block">
      <div
        onClick={handleClick}
        style={{ width: size, height: size }}
        className={`
          flex items-center justify-center border-2 border-dashed rounded-lg overflow-hidden cursor-pointer
          transition-all duration-200 ease-in-out
          ${previewUrl ? 'border-gray-300' : 'border-gray-400 hover:border-indigo-500 hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="text-indigo-600">
            <Plus size={32} />
          </div>
        )}
      </div>
    </div>
  );
};
