import { useState, useEffect } from 'react';
import { Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import { Ticket } from './ticket.types';
import TicketForm from './TicketForm';
import InvoiceModal from '../billing/InvoiceModal';
import DataTable, { DataTableColumn } from '../../components/ui/DataTable';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);

const columns: DataTableColumn[] = [
  {
    key: 'id',
    title: 'Ticket ID',
    dataIndex: 'id',
    sorter: (a, b) => a.id?.localeCompare(b.id || '') || 0,
    excelFilter: true, // Excel-style automatic filter
    filterMultiple: true,
  },
  {
    key: 'customer',
    title: 'Customer',
    dataIndex: 'customerId',
    render: (customerId) => customers.find(c => c.id === customerId)?.name || customerId,
    sorter: (a, b) => {
      const customerA = customers.find(c => c.id === a.customerId)?.name || '';
      const customerB = customers.find(c => c.id === b.customerId)?.name || '';
      return customerA.localeCompare(customerB);
    },
    excelFilter: true, // Excel-style automatic filter
    filterMultiple: true,
  },
  {
    key: 'technician',
    title: 'Technician',
    dataIndex: 'technicianId',
    render: (technicianId) => technicians.find(t => t.id === technicianId)?.name || technicianId,
    sorter: (a, b) => {
      const techA = technicians.find(t => t.id === a.technicianId)?.name || '';
      const techB = technicians.find(t => t.id === b.technicianId)?.name || '';
      return techA.localeCompare(techB);
    },
    excelFilter: true, // Excel-style automatic filter
    filterMultiple: true,
  },
  {
    key: 'device',
    title: 'Device',
    dataIndex: 'deviceId',
    render: (deviceId) => {
      const device = devices.find(d => d.id === deviceId);
      return device ? `${device.brand} ${device.model}` : deviceId;
    },
    sorter: (a, b) => {
      const deviceA = devices.find(d => d.id === a.deviceId);
      const deviceB = devices.find(d => d.id === b.deviceId);
      const nameA = deviceA ? `${deviceA.brand} ${deviceA.model}` : '';
      const nameB = deviceB ? `${deviceB.brand} ${deviceB.model}` : '';
      return nameA.localeCompare(nameB);
    },
    excelFilter: true, // Excel-style automatic filter
    filterMultiple: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status) => {
      let color = '';
      switch (status) {
        case 'RECEIVED':
          color = 'geekblue';
          break;
        case 'PENDING':
          color = 'orange';
          break;
        case 'IN_PROGRESS':
          color = 'blue';
          break;
        case 'READY_TO_DELIVER':
          color = 'cyan';
          break;
        case 'COMPLETED':
          color = 'green';
          break;
        case 'NOT_REPAIRABLE':
          color = 'volcano';
          break;
        case 'CANCELLED':
          color = 'red';
          break;
        default:
          color = 'gray';
      }
      return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
    },
    filters: [
      { text: 'Received', value: 'RECEIVED' },
      { text: 'Pending', value: 'PENDING' },
      { text: 'In Progress', value: 'IN_PROGRESS' },
      { text: 'Ready to Deliver', value: 'READY_TO_DELIVER' },
      { text: 'Completed', value: 'COMPLETED' },
      { text: 'Not Repairable', value: 'NOT_REPAIRABLE' },
      { text: 'Cancelled', value: 'CANCELLED' },
    ],
    onFilter: (value, record) => record.status === value,
    sorter: (a, b) => a.status.localeCompare(b.status),
    filterMultiple: true, // Allow multiple status selection
  },
  {
    key: 'consultancyFee',
    title: 'Consultancy Fee',
    dataIndex: 'consultancyFee',
    render: (fee) => fee ? `₹${fee}` : '-',
    sorter: (a, b) => (a.consultancyFee || 0) - (b.consultancyFee || 0),
    filterable: true, // Text search filter for numeric values
  },
  {
    key: 'receivedDate',
    title: 'Received Date',
    dataIndex: 'receivedDate',
    render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    sorter: (a, b) => new Date(a.receivedDate || '').getTime() - new Date(b.receivedDate || '').getTime(),
    excelFilter: true, // Excel-style automatic filter for dates
    filterMultiple: true,
  },
  {
    key: 'action',
    title: 'Action',
    dataIndex: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Button onClick={() => handleEdit(record)}>Edit</Button>
        <Button 
          icon={<PrinterOutlined />}
          onClick={() => handlePrintInvoice(record.id)}
          title="Print Invoice"
        >
          Print
        </Button>
        <Popconfirm
          title="Are you sure?"
          description="This action cannot be undone."
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            if (record.id) {
              handleDelete(record.id);
            } else {
              message.error('Invalid ticket ID');
            }
          }}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
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

  const handlePrintInvoice = (ticketId: string | undefined) => {
    if (!ticketId) {
      message.error('Cannot print invoice: Ticket ID is missing');
      return;
    }
    setSelectedTicketId(ticketId);
    setShowInvoiceModal(true);
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

      <DataTable
  columns={columns}
  data={tickets}
  loading={loading}
  title="Repair Tickets"
  rowKey="id"
  pagination={{ pageSize: 10 }}
  actions={
    <Button onClick={fetchData} loading={loading}>
      Refresh
    </Button>
  }
  searchable={true}
  searchPlaceholder="Search tickets by ID, customer, device..."
  maxHeight="500px"
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

      <InvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        ticketId={selectedTicketId}
      />
    </div>
  );
}