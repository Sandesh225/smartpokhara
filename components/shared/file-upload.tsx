// ============================================================================
// FILE: components/shared/file-upload.tsx
// Reusable file upload component with progress
// ============================================================================

'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string[];
  error?: string;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10,
  accept = ['image/*', 'application/pdf'],
  error,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const filesArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of filesArray) {
        // Check file count
        if (value.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          break;
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${maxSize}MB limit`);
          continue;
        }

        // Check file type
        const fileType = file.type;
        const isAllowed = accept.some((type) => {
          if (type === 'image/*') return fileType.startsWith('image/');
          if (type === 'application/pdf') return fileType === 'application/pdf';
          return fileType === type;
        });

        if (!isAllowed) {
          errors.push(`${file.name} is not an allowed file type`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    },
    [value, onChange, maxFiles, maxSize, accept]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
    },
    [value, onChange]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={value.length >= maxFiles}
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Images and PDF files up to {maxSize}MB (max {maxFiles} files)
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {value.length}/{maxFiles} files selected
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  ) : (
                    <FileIcon className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}