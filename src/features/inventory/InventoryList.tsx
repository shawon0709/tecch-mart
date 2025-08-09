import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import InventoryForm from './InventoryForm';

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  supplierId: string;
}

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const columns: ColumnsType<InventoryItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Tag color={quantity <= record.reorderLevel ? 'red' : 'green'}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      message.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = () => {
    fetchItems();
    handleFormClose();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Inventory Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
        >
          Add Item
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
      />

      <InventoryForm
        visible={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={editingItem}
      />
    </div>
  );
}