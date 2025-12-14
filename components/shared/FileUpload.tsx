// ============================================================================
// FILE: components/shared/file-upload.tsx
// Reusable file upload component with robust validation
// ============================================================================

'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileIcon, ImageIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button';
import { toast } from 'sonner'; // Assuming sonner is used for notifications

interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string[];
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10,
  // Note: acceptedTypes should match this
  accept = ['image/*', 'video/*', 'application/pdf'],
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const filesArray = Array.from(newFiles);
      const currentCount = value.length;
      const filesToAdd = filesArray.slice(0, maxFiles - currentCount);
      const errors: string[] = [];
      const validFiles: File[] = [];
      
      if (filesArray.length > filesToAdd.length) {
        errors.push(`Only the first ${filesToAdd.length} file(s) were processed to meet the max count.`);
      }

      for (const file of filesToAdd) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} exceeds ${maxSize}MB limit.`);
          continue;
        }

        // Check file type
        const fileType = file.type;
        const isAllowed = accept.some((type) => {
          if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -1));
          return fileType === type;
        });

        if (!isAllowed) {
          errors.push(`${file.name} is not an allowed type.`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        toast.error('File Validation Failed', {
          description: errors.join(' | '),
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 5000,
        });
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
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  }, [handleFiles]);

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
  
  const filesRemaining = maxFiles - value.length;

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
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${filesRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          multiple
          // Convert accepted types array to comma-separated string
          accept={accept.map(t => t.endsWith('/*') ? t.replace('/*', '') : t).join(',')}
          onChange={handleInputChange} // Use the new input change handler
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={filesRemaining === 0}
        />

        <div className="text-center">
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            {filesRemaining > 0 ? 'Click to upload or drag and drop' : 'Maximum files reached'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max {maxSize}MB each (Remaining: {filesRemaining} of {maxFiles})
          </p>
        </div>
      </div>

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? <ImageIcon className="h-6 w-6 text-blue-500" /> : <FileIcon className="h-6 w-6 text-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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