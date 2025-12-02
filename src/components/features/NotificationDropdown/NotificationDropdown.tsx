"use client";

import React, { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useDeleteNotification } from '@/hooks/api/useNotifications';
import { showToast } from '@/lib/utils/toast';

interface NotificationDropdownProps {
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [], isLoading, error, refetch } = useNotifications();
  
  // Debug logging
  React.useEffect(() => {
  }, [notifications, isLoading, error]);
  
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: Notification) => !n.is_read).length 
    : 0;
  
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      showToast("Bildirishnoma o'qildi", "success");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Xatolik yuz berdi";
      showToast(`${errorMessage}`, "error");
    }
  };

  // Barcha bildirishnomalarni o'qilgan deb belgilash
  const handleMarkAllAsRead = async () => {
    try {
      if (!Array.isArray(notifications)) return;
      
      const unreadNotifications = notifications.filter((n: Notification) => !n.is_read);
      
      // Har bir o'qilmagan bildirishnomani alohida o'qilgan deb belgilash
      const promises = unreadNotifications.map((notification: Notification) => 
        markAsRead.mutateAsync(notification.id)
      );
      
      await Promise.all(promises);
      showToast("✅ Barcha bildirishnomalar o'qildi", "success");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Xatolik yuz berdi";
      showToast(`❌ ${errorMessage}`, "error");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      showToast("✅ Bildirishnoma o'chirildi", "success");
      refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Xatolik yuz berdi";
      showToast(`❌ ${errorMessage}`, "error");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Hozir";
      if (diffInMinutes < 60) return `${diffInMinutes} daqiqa oldin`;
      if (diffInHours < 1) return "Hozir";
      if (diffInHours < 24) return `${diffInHours} soat oldin`;
      if (diffInHours < 48) return "Kecha";
      
      return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-white hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="fixed left-1/2 top-20 w-72 sm:w-80 md:w-96 bg-[#121212] border border-[#1a1a1a] rounded-lg shadow-xl z-50 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] transform -translate-x-1/2 sm:left-auto sm:right-4 sm:top-16 sm:translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#ff9900] rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-sm sm:text-base truncate">Bildirishnomalar</h3>
                {Array.isArray(notifications) && notifications.length > 0 && (
                  <p className="text-xs sm:text-sm text-[#a0a0a0] mt-1">
                    • {unreadCount} ta yangi
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-[#ff9900] text-black rounded hover:bg-[#ff6600] transition-colors"
                  title="Barchasini o'qildi deb belgilash"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 sm:p-1.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                title="Yopish"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#1a1a1a] border-t-[#ff9900]"></div>
                </div>
                <p className="text-[#a0a0a0] text-sm">Bildirishnomalar yuklanmoqda...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h4 className="text-white font-medium mb-2">Xatolik yuz berdi</h4>
                <p className="text-[#a0a0a0] text-sm mb-4">
                  {error && typeof error === 'object' && 'message' in error 
                    ? String(error.message) 
                    : "Bildirishnomalarni yuklashda muammo yuz berdi"}
                </p>
                <button 
                  onClick={() => refetch()}
                  className="px-6 py-2.5 bg-[#ff9900] text-black rounded-lg hover:bg-[#ff6600] transition-colors text-sm font-medium"
                >
                  Qayta urinish
                </button>
              </div>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-[#a0a0a0]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-[#666]" />
                </div>
                <h4 className="text-white font-medium mb-2 sm:mb-3 text-base sm:text-lg">Bildirishnomalar yo'q</h4>
                <button 
                  onClick={() => refetch()}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-[#ff9900] text-black rounded-lg hover:bg-[#ff6600] transition-colors text-sm sm:text-base font-medium"
                >
                  Yangilash
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-[#1a1a1a] transition-colors relative ${
                      !notification.is_read ? 'bg-[#1a1a1a]/30 border-l-2 border-l-[#ff9900]' : ''
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-[#ff9900] rounded-full"></div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#ff9900] rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-3 h-3 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium text-sm ${
                            !notification.is_read ? 'text-white font-semibold' : 'text-[#e0e0e0]'
                          } truncate`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-[#666] hover:text-[#ff9900] transition-colors rounded"
                                title="O'qildi deb belgilash"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            {/* <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 text-[#666] hover:text-red-500 transition-colors rounded"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button> */}
                          </div>
                        </div>
                        <p className="text-[#a0a0a0] text-sm leading-relaxed mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[#666] text-xs">
                            {formatDate(notification.created_at)}
                          </p>
                          {!notification.is_read && (
                            <span className="text-xs text-[#ff9900] font-medium">
                              Yangi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {/* {Array.isArray(notifications) && notifications.length > 0 && (
            <div className="p-3 border-t border-[#1a1a1a] text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#ff9900] hover:text-[#ff9900]/80 transition-colors text-sm font-medium"
              >
                Barchasini ko'rish
              </button>
            </div>
          )} */}
        </div>
      )}
    </>
  );
}