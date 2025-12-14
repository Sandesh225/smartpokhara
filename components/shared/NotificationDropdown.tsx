'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupervisorNotification } from '@/lib/types/supervisor.types'; // Assuming types exist

interface NotificationDropdownProps {
  notifications: SupervisorNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
}

export function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Icons based on notification type/priority
  const getIcon = (type: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-16 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onMarkAllAsRead}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          <AnimatePresence initial={false}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <CheckCircle2 className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs">No new notifications.</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <motion.li
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "relative transition-colors hover:bg-gray-50",
                    !notification.is_read ? "bg-blue-50/50" : "bg-white"
                  )}
                >
                  <div className="group flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <Link 
                      href={notification.metadata?.link || '#'} 
                      onClick={() => {
                        onMarkAsRead(notification.id);
                        onClose();
                      }}
                      className="flex-1 space-y-1"
                    >
                      <p className={cn("text-sm text-gray-900", !notification.is_read && "font-semibold")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </Link>

                    {/* Mark Read Indicator/Button */}
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="mt-1 h-2 w-2 rounded-full bg-blue-600 hover:scale-150 hover:bg-blue-400 transition-all"
                        title="Mark as read"
                        aria-label="Mark as read"
                      />
                    )}
                  </div>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-2 text-center">
        <Link
          href="/supervisor/notifications"
          onClick={onClose}
          className="block w-full rounded-md py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          View all notifications
        </Link>
      </div>
    </motion.div>
  );
}