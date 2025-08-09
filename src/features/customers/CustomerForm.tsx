import { Form, Input, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { Customer } from './customer.types';

interface CustomerFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: Customer | null;
}

export default function CustomerForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: CustomerFormProps) {
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
        ? `/api/customers/${initialValues.id}`
        : '/api/customers';
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
          initialValues ? 'Customer updated successfully' : 'Customer added successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save customer');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Customer' : 'Add Customer'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the customer name!' }]}
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