import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PrinterOutlined } from '@ant-design/icons';
import { Ticket } from '../repairs/ticket.types';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

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
      title: 'Amount',
      dataIndex: 'invoiceTotal',
      key: 'amount',
      render: (amount) => amount ? `$${amount.toFixed(2)}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'COMPLETED':
            color = 'green';
            break;
          default:
            color = 'orange';
        }
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
            Print
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, customersRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/customers'),
      ]);

      setInvoices(await ticketsRes.json());
      setCustomers(await customersRes.json());
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (invoice: Ticket) => {
    // In a real app, this would generate a PDF or open a print dialog
    message.info(`Printing invoice for ticket ${invoice.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Invoice Management</h2>
      </div>

      <Table
        columns={columns}
        dataSource={invoices}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
}