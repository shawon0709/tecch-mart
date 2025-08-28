import { useState, useEffect } from 'react';
import { Button, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import InventoryForm from './InventoryForm';
import { InventoryItem } from './inventory.types';
import DataTable, { DataTableColumn } from '../../components/ui/DataTable';

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const columns: DataTableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      key: 'brand',
      title: 'Brand',
      dataIndex: 'brand',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      render: (model) => model || 'N/A',
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      render: (serialNumber) => serialNumber || 'N/A',
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity, record) => (
        <Tag color={quantity <= record.reorderLevel ? 'red' : 'green'}>
          {quantity}
        </Tag>
      ),
    },
    {
      key: 'reorderLevel',
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      sorter: (a, b) => a.reorderLevel - b.reorderLevel,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={record.quantity <= record.reorderLevel ? 'red' : 'green'}>
          {record.quantity <= record.reorderLevel ? 'Low Stock' : 'In Stock'}
        </Tag>
      ),
      filters: [
        { text: 'Low Stock', value: 'low' },
        { text: 'In Stock', value: 'normal' },
      ],
      onFilter: (value, record) => {
        if (value === 'low') return record.quantity <= record.reorderLevel;
        if (value === 'normal') return record.quantity > record.reorderLevel;
        return true;
      },
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
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

  const handleDelete = async (id?: string) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Item deleted successfully');
        fetchItems();
      } else {
        message.error('Failed to delete item');
      }
    } catch (error) {
      message.error('An error occurred');
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

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        title="Inventory Items"
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
        actions={
          <Button onClick={fetchItems} loading={loading}>
            Refresh
          </Button>
        }
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