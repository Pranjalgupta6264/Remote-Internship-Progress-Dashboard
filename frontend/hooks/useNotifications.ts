'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'react-hot-toast';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api';
import { Notification } from '@/types';

export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const items = await getNotifications();
      setNotifications(items);
    } catch {
      // Keep dashboard usable even if notification endpoint fails.
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const refreshTimer = setTimeout(() => {
      void refreshNotifications();
    }, 0);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const wsFallbackBase = apiUrl.replace('/api/v1', '').replace('http://', 'ws://').replace('https://', 'wss://');
    const wsTemplate = process.env.NEXT_PUBLIC_WS_URL || `${wsFallbackBase}/ws/{userId}`;
    const wsUrl = wsTemplate.replace('{userId}', user.id);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Show real-time alert via toast
      toast(data.message, {
        icon: '🔔',
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
        },
      });
      void refreshNotifications();
    };

    ws.onclose = () => {
      console.log('Notification WebSocket disconnected');
    };

    socketRef.current = ws;

    return () => {
      clearTimeout(refreshTimer);
      ws.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, refreshNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const markOneRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      await refreshNotifications();
    } catch {
      toast.error('Failed to update notification.');
    }
  }, [refreshNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await refreshNotifications();
    } catch {
      toast.error('Failed to mark all notifications.');
    }
  }, [refreshNotifications]);

  return {
    socketRef,
    notifications,
    unreadCount,
    refreshNotifications,
    markOneRead,
    markAllRead,
  };
}
