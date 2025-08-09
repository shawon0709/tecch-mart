import { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import DeviceForm from './DeviceForm';
import { Device } from './ticket.types';

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const columns: ColumnsType<Device> = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customer',
      render: (id) => customers.find(c => c.id === id)?.name || id,
    },
    {
      title: 'Problem',
      dataIndex: 'problem',
      key: 'problem',
      render: (problem) => problem || 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button
  danger
  onClick={() => {
    if (record.id) {
      handleDelete(record.id);
    } else {
      message.error('Invalid device ID');
    }
  }}
>
  Delete
</Button>

        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesRes, customersRes, techniciansRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/customers'),
        fetch('/api/technicians'),
      ]);

      setDevices(await devicesRes.json());
      setCustomers(await customersRes.json());
      setTechnicians(await techniciansRes.json());
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Device deleted successfully');
        fetchData();
      } else {
        message.error('Failed to delete device');
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDevice(null);
  };

  const handleFormSubmit = () => {
    fetchData();
    handleFormClose();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Device Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          Add Device
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={devices}
        loading={loading}
        rowKey="id"
      />

      <DeviceForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingDevice}
        customers={customers}
        technicians={technicians}
      />
    </div>
  );
}