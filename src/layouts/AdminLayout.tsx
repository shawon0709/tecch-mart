import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Badge, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DesktopOutlined,
  UserOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { getAuthToken, removeAuthToken } from '../lib/auth';

const { Sider, Content } = Layout;

type MenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const user = getAuthToken();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    removeAuthToken();
    router.push('/');
  };

const items: MenuItem[] = [
  { key: 'dashboard', icon: <DesktopOutlined />, label: 'Dashboard' },
  { 
    key: 'repairs', 
    icon: <ToolOutlined />, 
    label: 'Repairs',
    children: [
      { key: 'customers', label: 'Customers' }, // Moved here
      { key: 'tickets', label: 'Tickets' },
      { key: 'devices', label: 'Devices' },
    ]
  },
  { key: 'technicians', icon: <ToolOutlined />, label: 'Technicians' },
  { key: 'receivers', icon: <UserOutlined />, label: 'Receivers' }, // New menu
  { key: 'suppliers', icon: <UserOutlined />, label: 'Suppliers' },
  { key: 'inventory', icon: <ShoppingCartOutlined />, label: 'Inventory' },
  { key: 'billing', icon: <FileTextOutlined />, label: 'Billing' },
  { key: 'reports', icon: <BarChartOutlined />, label: 'Reports' },
];

  const userMenu = (
    <Menu
      items={[
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ]}
    />
  );

  // Get current section label
function findLabelByKey(items: MenuItem[], key: string): string | undefined {
  for (const item of items) {
    if (item.key === key) return item.label;
    if (item.children) {
      const childLabel = findLabelByKey(item.children, key);
      if (childLabel) return childLabel;
    }
  }
  return undefined;
}

const currentTitle = useMemo(() => {
  const sectionKey = (router.query.section as string) || 'dashboard';
  return findLabelByKey(items, sectionKey) || '';
}, [router.query.section]);



  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} trigger={null}>
  <div className="flex items-center justify-center m-4">
    {collapsed ? (
      <div className="text-center leading-tight">
        <span className="block font-bold text-xs" style={{ color: '#0088FE' }}>TECH</span>
        <span className="block font-bold text-xs" style={{ color: '#FF8042' }}>MART</span>
      </div>
    ) : (
      <div className="flex items-baseline">
        <span className="font-bold text-lg" style={{ color: '#0088FE' }}>TECH</span>
        <span className="font-bold text-lg ml-1" style={{ color: '#FF8042' }}>MART</span>
      </div>
    )}
  </div>

  <Menu
    theme="dark"
    defaultSelectedKeys={['dashboard']}
    mode="inline"
    items={items}
    onClick={({ key }) => router.push(`/dashboard?section=${key}`)}
  />
</Sider>
      {/* Main Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div
          className="flex justify-between items-center h-16 px-4"
          style={{ background: colorBgContainer }}
        >
          {/* Left side: toggle + title */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <span className="text-lg font-semibold">{currentTitle}</span>
          </div>

          {/* Right side: notifications + user */}
<div className="flex items-center space-x-6 pr-4">
  <Badge count={5} offset={[-2, 6]}>
    <BellOutlined
      className="text-2xl cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200"
      aria-label="Notifications"
    />
  </Badge>
  <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
    <div className="flex items-center cursor-pointer space-x-3 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors duration-200">
      <Avatar size="small" icon={<UserOutlined />} />
      <span className="text-sm ml-2 font-medium text-gray-700 select-none">{user?.name || 'User'}</span>
    </div>
  </Dropdown>
</div>

        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
