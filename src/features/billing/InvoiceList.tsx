import { useState, useEffect } from 'react';
import { Button, Space, Tag, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { Ticket } from '../repairs/ticket.types';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const columns: DataTableColumn[] = [
    {
      key: 'id',
      title: 'Ticket ID',
      dataIndex: 'id',
      excelFilter: true,
      sorter: (a, b) => (a.id || '').localeCompare(b.id || ''),
    },
    {
      key: 'customerId',
      title: 'Customer',
      dataIndex: 'customerId',
      excelFilter: true,
      render: (id) => customers.find((c) => c.id === id)?.name || id,
      sorter: (a, b) => {
        const nameA = customers.find((c) => c.id === a.customerId)?.name || '';
        const nameB = customers.find((c) => c.id === b.customerId)?.name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      key: 'invoiceTotal',
      title: 'Amount',
      dataIndex: 'invoiceTotal',
      excelFilter: true,
      render: (amount) => (amount ? `$${amount.toFixed(2)}` : '-'),
      sorter: (a, b) => (a.invoiceTotal || 0) - (b.invoiceTotal || 0),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      excelFilter: true,
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
      filters: [
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Pending', value: 'PENDING' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
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
    message.info(`Printing invoice for ticket ${invoice.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        rowKey="id"
        searchable={true}
        showSearch={true}
        onSearch={(searchText) => {
          console.log('Searching invoices for:', searchText);
        }}
        actions={
          <>
            <Button onClick={fetchData} loading={loading}>
              Refresh
            </Button>
          </>
        }
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </div>
  );
}
