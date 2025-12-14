'use client';

import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
  urgencyLevel?: 'low' | 'medium' | 'high'; // To color the badge
}

export function NotificationBell({ 
  unreadCount, 
  isOpen, 
  onClick, 
  urgencyLevel = 'medium' 
}: NotificationBellProps) {
  
  const badgeColors = {
    low: 'bg-blue-500',
    medium: 'bg-orange-500',
    high: 'bg-red-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isOpen ? "bg-gray-100 text-blue-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      aria-expanded={isOpen}
    >
      <Bell className="h-6 w-6" />

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              "absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white",
              badgeColors[urgencyLevel]
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
            
            {/* Pulsing Ping Effect */}
            <motion.span
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "absolute h-full w-full rounded-full opacity-50",
                badgeColors[urgencyLevel]
              )}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}