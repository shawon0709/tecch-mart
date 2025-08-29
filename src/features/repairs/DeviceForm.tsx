import { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import { Device } from './ticket.types';

const { Option } = Select;
const { TextArea } = Input;

interface DeviceFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: Device | null;
  customers: any[];
}

export default function DeviceForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
  customers,
}: DeviceFormProps) {
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
        ? `/api/devices/${initialValues.id}`
        : '/api/devices';
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
          initialValues ? 'Device updated successfully' : 'Device added successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save device');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Device' : 'Add Device'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="serialNumber"
          label="Serial Number"
          rules={[{ required: true, message: 'Please input serial number!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="brand"
          label="Brand"
          rules={[{ required: true, message: 'Please input brand!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="model"
          label="Model"
          rules={[{ required: true, message: 'Please input model!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="customerId"
          label="Customer"
          rules={[{ required: true, message: 'Please select customer!' }]}
        >
          <Select placeholder="Select customer">
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Device Description"
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
        >
          <TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}