import { useState } from 'react';
import { BellOutlined, CheckOutlined, ExclamationOutlined, WarningOutlined, InfoOutlined } from '@ant-design/icons';
import { Badge, Dropdown, List, Button, Space, Typography, Tag, Divider } from 'antd';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../features/notifications/notification.types';

const { Text } = Typography;

export default function NotificationDropdown() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { state, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'URGENT':
        return <ExclamationOutlined style={{ color: '#ff4d4f' }} />;
      case 'WARNING':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'SUCCESS':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'INFO':
      default:
        return <InfoOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'URGENT': return 'red';
      case 'WARNING': return 'orange';
      case 'SUCCESS': return 'green';
      case 'INFO': return 'blue';
      default: return 'gray';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setDropdownVisible(false);
    
    if (notification.link) {
      // Navigate to the link
      window.location.href = notification.link;
    }
  };

  const notificationList = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'auto', backgroundColor: '#fafafa', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        <Space>
          <Button size="small" onClick={refreshNotifications}>
            Refresh
          </Button>
          {state.unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      <List
        dataSource={state.notifications}
        loading={state.loading}
        locale={{ emptyText: 'No notifications' }}
        renderItem={(notification) => (
          <List.Item
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor: notification.read ? '#fff' : '#f6ffed',
              borderBottom: '1px solid #f0f0f0'
            }}
            onClick={() => handleNotificationClick(notification)}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(notification.type)}
              title={
                <Space>
                  <Text style={{ fontSize: '14px' }}>{notification.title}</Text>
                  {!notification.read && <Tag color="blue">New</Tag>}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {notification.message}
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      {state.notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '12px 16px', textAlign: 'center' }}>
            <Button type="link" size="small" onClick={() => setDropdownVisible(false)}>
              Close
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationList}
      trigger={['click']}
      visible={dropdownVisible}
      onVisibleChange={setDropdownVisible}
      placement="bottomRight"
    >
      <Badge count={state.unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: '16px' }}
          loading={state.loading}
        />
      </Badge>
    </Dropdown>
  );
}