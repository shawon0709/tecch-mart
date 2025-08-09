import { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import { Ticket } from './ticket.types';

const { Option } = Select;
const { TextArea } = Input;

interface TicketFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues?: Ticket | null;
  customers: any[];
  technicians: any[];
  devices: any[];
}

export default function TicketForm({
  visible,
  onClose,
  onSubmit,
  initialValues,
  customers,
  technicians,
  devices,
}: TicketFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventoryItems(data);
    } catch (error) {
      message.error('Failed to fetch inventory items');
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const url = initialValues
        ? `/api/tickets/${initialValues.id}`
        : '/api/tickets';
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
          initialValues ? 'Ticket updated successfully' : 'Ticket created successfully'
        );
        onSubmit();
      } else {
        message.error('Failed to save ticket');
      }
    } catch (error) {
      message.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Ticket' : 'Create Ticket'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="customerId"
            label="Customer"
            rules={[{ required: true, message: 'Please select a customer!' }]}
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
            name="technicianId"
            label="Technician"
            rules={[{ required: true, message: 'Please select a technician!' }]}
          >
            <Select placeholder="Select technician">
              {technicians.map(tech => (
                <Option key={tech.id} value={tech.id}>
                  {tech.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
  name="deviceId"
  label="Device"
  rules={[{ required: true, message: 'Please select a device!' }]}
>
<Select
  placeholder="Select device"
  showSearch
  optionFilterProp="label"
  filterOption={(input, option) => {
    const label = option?.label;
    if (typeof label === 'string') {
      return label.toLowerCase().includes(input.toLowerCase());
    } else if (typeof label === 'number') {
      return label.toString().toLowerCase().includes(input.toLowerCase());
    }
    return false;
  }}
>
  {devices.map(device => (
    <Option
      key={device.id}
      value={device.id}
      label={`${device.brand} ${device.model} (SN: ${device.serialNumber}) - ${customers.find(c => c.id === device.customerId)?.name || 'Unknown'}`}
    >
      {device.brand} {device.model} (SN: {device.serialNumber}) - {customers.find(c => c.id === device.customerId)?.name || 'Unknown'}
    </Option>
  ))}
</Select>


</Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="PENDING">Pending</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input description!' }]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="diagnosis"
          label="Diagnosis"
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="report"
          label="Report"
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="timeline"
          label="Timeline"
        >
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="invoiceTotal"
          label="Invoice Total"
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
}