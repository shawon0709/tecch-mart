import { useState, useEffect } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { Supplier } from './supplier.types';

interface SupplierFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: Supplier | null;
}

export default function SupplierForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: SupplierFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const url = initialValues
        ? `/api/suppliers/${initialValues.id}`
        : '/api/suppliers';
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
          initialValues ? 'Supplier updated successfully' : 'Supplier added successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save supplier');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Supplier' : 'Add Supplier'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the supplier name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Please input a valid email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}