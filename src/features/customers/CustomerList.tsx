import { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import CustomerForm from './CustomerForm';
import { Customer } from './customer.types';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Customer Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          Add Customer
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
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