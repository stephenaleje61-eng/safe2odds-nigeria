import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Award, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../types';
import { ApiClient } from '../services/apiClient';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onRefresh: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await ApiClient.markNotificationRead(id);
    onRefresh();
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await ApiClient.markAllNotificationsRead();
    setMarkingAll(false);
    onRefresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] font-bold text-green-700 hover:text-green-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    notif.read ? 'bg-white hover:bg-gray-50' : 'bg-green-50/40 hover:bg-green-50/70'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'PREDICTION_WON' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    ) : notif.type === 'PREDICTION_LOST' ? (
                      <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{notif.title}</h4>
                      {!notif.read && (
                        <button
                          onClick={e => handleMarkAsRead(notif.id, e)}
                          title="Mark read"
                          className="text-gray-400 hover:text-green-700 p-0.5"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
