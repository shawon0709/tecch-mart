export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}