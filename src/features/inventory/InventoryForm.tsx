import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { InventoryItem } from './inventory.types';

interface InventoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: InventoryItem | null;
}

export default function InventoryForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: InventoryFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (error) {
      message.error('Failed to fetch suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const url = initialValues
        ? `/api/inventory/${initialValues.id}`
        : '/api/inventory';
      const method = initialValues ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          initialValues ? 'Item updated successfully' : 'Item added successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save item');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Inventory Item' : 'Add Inventory Item'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please input the item name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="serialNumber"
            label="Serial Number"
            rules={[{ required: true, message: 'Please input the model!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Please input the brand!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Please input the model!' }]}
          >
            <Input />
          </Form.Item>
          
        </div>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please input the category!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please input the quantity!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="reorderLevel"
            label="Reorder Level"
            rules={[{ required: true, message: 'Please input the reorder level!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item
          name="supplierId"
          label="Supplier"
          rules={[{ required: true, message: 'Please select a supplier!' }]}
        >
          <Select
            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}