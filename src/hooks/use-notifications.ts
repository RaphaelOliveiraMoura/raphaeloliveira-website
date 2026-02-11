"use client";

import { useSyncExternalStore } from "react";

import { isClient } from "@/lib/utils/environment";

type NotificationCategory = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
}

const STORAGE_KEY = "core-stack:notifications";

function getStoredNotifications(): Notification[] {
  if (!isClient()) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Notification[]) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent("notifications-change"));
}

let cachedNotifications: Notification[] | null = null;

function getSnapshot(): NotificationStore {
  const notifications = cachedNotifications ?? getStoredNotifications();
  cachedNotifications = notifications;
  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

function getServerSnapshot(): NotificationStore {
  return { notifications: [], unreadCount: 0 };
}

function subscribe(callback: () => void): () => void {
  const handler = () => {
    cachedNotifications = null;
    callback();
  };

  window.addEventListener("notifications-change", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) handler();
  });

  return () => {
    window.removeEventListener("notifications-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function addNotification(
  notification: Omit<Notification, "id" | "read" | "createdAt">,
) {
  const notifications = getStoredNotifications();
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  saveNotifications([newNotification, ...notifications]);
}

function markAsRead(id: string) {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  saveNotifications(updated);
}

function markAllAsRead() {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

function removeNotification(id: string) {
  const notifications = getStoredNotifications();
  saveNotifications(notifications.filter((n) => n.id !== id));
}

function clearAll() {
  saveNotifications([]);
}

export function useNotifications() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...store,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

export type { Notification, NotificationCategory };
