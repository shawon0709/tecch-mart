import { useState, useEffect } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { Technician } from './technician.types';

interface TechnicianFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: Technician | null;
}

export default function TechnicianForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: TechnicianFormProps) {
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
        ? `/api/technicians/${initialValues.id}`
        : '/api/technicians';
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
          initialValues ? 'Technician updated successfully' : 'Technician added successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save technician');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Technician' : 'Add Technician'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the technician name!' }]}
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
      </Form>
    </Modal>
  );
}