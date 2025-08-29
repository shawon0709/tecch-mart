import { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { Device } from './ticket.types';

interface DeviceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (device: Device) => void;
  customerId?: string;
}

export default function DeviceSelectionModal({
  visible,
  onClose,
  onSelect,
  customerId
}: DeviceSelectionModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  const columns: ColumnsType<Device> = [
    {
      title: 'Unique ID',
      dataIndex: 'uniqueId',
      key: 'uniqueId',
      render: (uniqueId) => (
        <Tag color="blue">{uniqueId || 'N/A'}</Tag>
      ),
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
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customer',
      render: (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
      },
    },
    {
      title: 'Problem Type',
      dataIndex: 'problemType',
      key: 'problemType',
      render: (problemType) => (
        <Tag color={problemType === 'HARDWARE' ? 'red' : problemType === 'SOFTWARE' ? 'blue' : 'orange'}>
          {problemType || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleSelect(record)}
        >
          Select
        </Button>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesRes, customersRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/customers'),
      ]);

      const devicesData = await devicesRes.json();
      const customersData = await customersRes.json();

      setDevices(devicesData);
      setCustomers(customersData);
      setFilteredDevices(devicesData);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  useEffect(() => {
    let filtered = devices;
    
    // Filter by customer if specified
    if (customerId) {
      filtered = filtered.filter(device => device.customerId === customerId);
    }
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(device =>
        Object.values(device).some(value =>
          value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    setFilteredDevices(filtered);
  }, [searchText, devices, customerId]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleSelect = (device: Device) => {
    onSelect(device);
    onClose();
  };

  const generateUniqueId = (device: Device): string => {
    // Generate a unique identifier: BRAND-MODEL-SERIAL (first 4 chars each)
    const brandCode = device.brand.substring(0, 4).toUpperCase();
    const modelCode = device.model.substring(0, 4).toUpperCase();
    const serialCode = device.serialNumber.substring(0, 4).toUpperCase();
    return `${brandCode}-${modelCode}-${serialCode}`;
  };

  return (
    <Modal
      title="Select Device"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div className="mb-4">
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Search devices by brand, model, serial number, or problem..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
          <div>
            {customerId && (
              <Tag color="green">
                Filtered by customer: {customers.find(c => c.id === customerId)?.name}
              </Tag>
            )}
            <span className="text-gray-500 ml-2">
              {filteredDevices.length} device(s) found
            </span>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredDevices}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 800 }}
        size="middle"
      />

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">Can't find the device?</h4>
        <p className="text-sm text-gray-600">
          If the device doesn't exist in the system, you'll need to add it first 
          through the Devices management section.
        </p>
      </div>
    </Modal>
  );
}