import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { ShoppingCartOutlined, ToolOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';

export default function OverviewCards() {
  const [stats, setStats] = useState({
    activeTickets: 0,
    lowStockItems: 0,
    customers: 0,
    recentSales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel
        const [ticketsRes, inventoryRes, customersRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/inventory'),
          fetch('/api/customers'),
        ]);

        const tickets = await ticketsRes.json();
        const inventory = await inventoryRes.json();
        const customers = await customersRes.json();

        // Calculate statistics
        const activeTickets = tickets.filter((ticket: any) => 
          ticket.status === 'PENDING' || ticket.status === 'IN_PROGRESS'
        ).length;

        const lowStockItems = inventory.filter((item: any) => 
          item.quantity <= item.reorderLevel
        ).length;

        const recentSales = tickets.filter((ticket: any) => 
          ticket.status === 'COMPLETED' && 
          new Date(ticket.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          activeTickets,
          lowStockItems,
          customers: customers.length,
          recentSales
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mb-6">
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Tickets"
                value={stats.activeTickets}
                prefix={<ToolOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={stats.lowStockItems}
                prefix={<ShoppingCartOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Customers"
                value={stats.customers}
                prefix={<UserOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Recent Sales (7 days)"
                value={stats.recentSales}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}