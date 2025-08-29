import { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Receiver } from './receiver.types';
import ReceiverForm from './ReceiverForm';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';

export default function ReceiverList() {
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState<Receiver | null>(null);

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
                message.error('Receiver ID is missing');
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchReceivers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/receivers');
      const data = await response.json();
      setReceivers(data);
    } catch (error) {
      message.error('Failed to fetch receivers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/receivers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Receiver deleted successfully');
        fetchReceivers();
      } else {
        message.error('Failed to delete receiver');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchReceivers();
  }, []);

  const handleEdit = (receiver: Receiver) => {
    setEditingReceiver(receiver);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingReceiver(null);
  };

  const handleFormSubmit = () => {
    fetchReceivers();
    handleFormClose();
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={receivers}
        loading={loading}
        rowKey="id"
        searchable={true}
        showSearch={true}
        onSearch={(searchText) => {
          console.log('Searching receivers for:', searchText);
        }}
        actions={
          <>
            <Button onClick={fetchReceivers} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              Add Receiver
            </Button>
          </>
        }
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <ReceiverForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingReceiver}
      />
    </div>
  );
}
