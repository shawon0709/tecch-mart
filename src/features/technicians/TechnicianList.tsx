import { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import TechnicianForm from './TechnicianForm';
import { Technician } from './technician.types';

export default function TechnicianList() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const columns: ColumnsType<Technician> = [
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

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/technicians');
      const data = await response.json();
      setTechnicians(data);
    } catch (error) {
      message.error('Failed to fetch technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/technicians/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Technician deleted successfully');
        fetchTechnicians();
      } else {
        message.error('Failed to delete technician');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTechnician(null);
  };

  const handleFormSubmit = () => {
    fetchTechnicians();
    handleFormClose();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Technician Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          Add Technician
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={technicians}
        loading={loading}
        rowKey="id"
      />

      <TechnicianForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingTechnician}
      />
    </div>
  );
}