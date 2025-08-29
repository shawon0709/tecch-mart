import { useState, useEffect } from 'react';
import { Button, Space, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Customer } from './customer.types';
import CustomerForm from './CustomerForm';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const columns: DataTableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      excelFilter: true,
      filterMultiple: true,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      excelFilter: true,
      filterMultiple: true,
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      excelFilter: true,
      filterMultiple: true,
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: 'address',
      excelFilter: true,
      filterMultiple: true,
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button
            danger
            onClick={() => {
              if (record.id) {
                handleDelete(record.id);
              } else {
                message.error('Invalid customer ID');
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Customer deleted successfully');
        fetchCustomers();
      } else {
        message.error('Failed to delete customer');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = () => {
    fetchCustomers();
    handleFormClose();
  };

  return (
    <div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        rowKey="id"
        searchable={true}
        showSearch={true}
        onSearch={(searchText) => {
          // You can implement custom search logic here if needed
          console.log('Searching for:', searchText);
        }}
        actions={
          <>
          <Button onClick={fetchCustomers} loading={loading}>
      Refresh
    </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(true)}
          >
            Add Customer
          </Button>
          </>
        }
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <CustomerForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingCustomer}
      />
    </div>
  );
}