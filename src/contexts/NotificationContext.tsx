import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification, NotificationState } from '../features/notifications/notification.types';

interface NotificationContextType {
  state: NotificationState;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Reducer for notification state
function notificationReducer(state: NotificationState, action: any): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n: Notification) => !n.read).length,
        loading: false
      };
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
    
    case 'MARK_ALL_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };
    
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

// Function to analyze database and generate notifications
async function analyzeDatabaseForNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch('/api/notifications/analyze');
    if (!response.ok) {
      throw new Error('Failed to analyze database');
    }
    return await response.json();
  } catch (error) {
    console.error('Error analyzing database:', error);
    return [];
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: true
  });

  // Load and analyze notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const analyzedNotifications = await analyzeDatabaseForNotifications();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: analyzedNotifications });
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Fallback to empty array
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }
    };

    loadNotifications();

    // Set up polling for real-time updates (every 5 minutes)
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const refreshNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const analyzedNotifications = await analyzeDatabaseForNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: analyzedNotifications });
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        state,
        markAsRead,
        markAllAsRead,
        addNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}