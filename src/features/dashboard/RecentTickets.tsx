import { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Ticket {
  id: string;
  customerId: string;
  deviceId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  userId: string;
}

type ProblemType = 'HARDWARE' | 'SOFTWARE' | 'OTHER';

interface Device {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  description: string;
  remarks: string;
  problem: string;
  problemType: ProblemType;
  customerId: string;
  technicianId: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentTicketDisplay {
  key: string;
  id: string;
  customer: string;
  device: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export default function RecentTickets() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<RecentTicketDisplay[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  const columns: ColumnsType<RecentTicketDisplay> = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'PENDING':
            color = 'orange';
            break;
          case 'IN_PROGRESS':
            color = 'blue';
            break;
          case 'COMPLETED':
            color = 'green';
            break;
          case 'CANCELLED':
            color = 'red';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel
        const [ticketsRes, customersRes, devicesRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/customers'),
          fetch('/api/devices'),
        ]);

        const ticketsData: Ticket[] = await ticketsRes.json();
        const customersData: Customer[] = await customersRes.json();
        const devicesData: Device[] = await devicesRes.json();

        setCustomers(customersData);
        setDevices(devicesData);

        // Transform the data for display
        const displayData = ticketsData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5) // Get only the 5 most recent tickets
          .map(ticket => ({
            key: ticket.id,
            id: ticket.id,
            customer: customersData.find((c: Customer) => c.id === ticket.customerId)?.name || 'Unknown Customer',
            device: (() => {
              const device = devicesData.find((d: Device) => d.id === ticket.deviceId);
              return device ? `${device.brand} ${device.model}` : 'Unknown Device';
            })(),
            status: ticket.status,
            createdAt: ticket.createdAt,
          }));

        setTickets(displayData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card title="Recent Tickets">
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={tickets}
          pagination={false}
          locale={{ emptyText: loading ? 'Loading...' : 'No tickets found' }}
        />
      </Spin>
    </Card>
  );
}
