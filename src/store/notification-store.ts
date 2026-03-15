'use client'

import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  is_read: number
  created_at: string
}

interface NotificationState {
  unreadCount: number
  notifications: AppNotification[]
  setUnreadCount: (count: number) => void
  setNotifications: (notifs: AppNotification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setNotifications: (notifications) => set({ notifications }),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: 1 } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: 1 })),
      unreadCount: 0,
    })),
}))
