import { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { Device } from './ticket.types';
import DeviceForm from './DeviceForm';
import DeviceHistoryModal from '../deviceHistory/DeviceHistoryModal';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const columns: DataTableColumn[] = [
    {
      key: 'serialNumber',
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      excelFilter: true,
      sorter: (a, b) => (a.serialNumber || '').localeCompare(b.serialNumber || ''),
    },
    {
      key: 'brand',
      title: 'Brand',
      dataIndex: 'brand',
      excelFilter: true,
      sorter: (a, b) => (a.brand || '').localeCompare(b.brand || ''),
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      excelFilter: true,
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
    },
    {
      key: 'customerId',
      title: 'Customer',
      dataIndex: 'customerId',
      excelFilter: true,
      render: (id) => customers.find((c) => c.id === id)?.name || id,
      sorter: (a, b) =>
        (customers.find((c) => c.id === a.customerId)?.name || '').localeCompare(
          customers.find((c) => c.id === b.customerId)?.name || ''
        ),
    },
    {
      key: 'problem',
      title: 'Problem',
      dataIndex: 'problem',
      excelFilter: true,
      render: (problem) => problem || 'N/A',
      sorter: (a, b) => (a.problem || '').localeCompare(b.problem || ''),
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
            title="View Repair History"
          >
            History
          </Button>
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

  const handleViewHistory = (device: Device) => {
    setSelectedDevice(device);
    setShowHistory(true);
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

      <DataTable
        columns={columns}
        data={devices}
        loading={loading}
        rowKey="id"
        searchable={true}
        showSearch={true}
        onSearch={(searchText) => {
          console.log('Searching devices for:', searchText);
        }}
        actions={
          <>
          <Button onClick={fetchData} loading={loading}>
      Refresh
    </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(true)}
          >
            Add Device
          </Button>
          </>
          
          
        }
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <DeviceForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingDevice}
        customers={customers}
      />

      <DeviceHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        deviceId={selectedDevice?.id || ''}
      />
    </div>
  );
}
