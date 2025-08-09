import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import TicketForm from './TicketForm';
import { Ticket } from './ticket.types';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  const columns: ColumnsType<Ticket> = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customer',
      render: (id) => customers.find(c => c.id === id)?.name || id,
    },
    {
      title: 'Technician',
      dataIndex: 'technicianId',
      key: 'technician',
      render: (id) => technicians.find(t => t.id === id)?.name || id,
    },
    {
      title: 'Device',
      dataIndex: 'deviceId',
      key: 'device',
      render: (id) => devices.find(d => d.id === id)?.model || id,
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, customersRes, techniciansRes, devicesRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/customers'),
        fetch('/api/technicians'),
        fetch('/api/devices'),
      ]);

      setTickets(await ticketsRes.json());
      setCustomers(await customersRes.json());
      setTechnicians(await techniciansRes.json());
      setDevices(await devicesRes.json());
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Ticket deleted successfully');
        fetchData();
      } else {
        message.error('Failed to delete ticket');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTicket(null);
  };

  const handleFormSubmit = () => {
    fetchData();
    handleFormClose();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Repair Ticket Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          Create Ticket
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tickets}
        loading={loading}
        rowKey="id"
      />

      <TicketForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingTicket}
        customers={customers}
        technicians={technicians}
        devices={devices}
      />
    </div>
  );
}