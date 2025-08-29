import { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Supplier } from './supplier.types';
import SupplierForm from './SupplierForm';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const columns: DataTableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      excelFilter: true,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      excelFilter: true,
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      excelFilter: true,
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: 'address',
      excelFilter: true,
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
                message.error('Invalid supplier ID');
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      message.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Supplier deleted successfully');
        fetchSuppliers();
      } else {
        message.error('Failed to delete supplier');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleFormSubmit = () => {
    fetchSuppliers();
    handleFormClose();
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        rowKey="id"
        searchable={true}
        showSearch={true}
        onSearch={(searchText) => {
          console.log('Searching suppliers for:', searchText);
        }}
        actions={
          <>
            <Button onClick={fetchSuppliers} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              Add Supplier
            </Button>
          </>
        }
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <SupplierForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingSupplier}
      />
    </div>
  );
}
