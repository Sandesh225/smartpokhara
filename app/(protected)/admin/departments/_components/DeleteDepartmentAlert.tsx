'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteDepartmentAlert({ departmentName }: { departmentName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" /> Delete Department
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-red-100 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Delete Department?</h3>
            <p className="text-sm text-red-700 mt-1">
              This action cannot be undone. This will permanently delete <strong>{departmentName}</strong> and remove all associated data.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white flex justify-end gap-3">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-lg border border-neutral-stone-200 text-neutral-stone-600 font-medium hover:bg-neutral-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => alert('Delete logic would happen here')}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}