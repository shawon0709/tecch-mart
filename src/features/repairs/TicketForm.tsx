import { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, DatePicker, message, Row, Col, Button, InputNumber, Tag } from 'antd';
import { Ticket, Device } from './ticket.types';
import DeviceSelectionModal from './DeviceSelectionModal';
import dayjs from 'dayjs';

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

// Consultancy fee options
const consultancyFeeOptions = [
  { value: 200, label: 'BDT 200 - [Basic Consultation]' },
  { value: 500, label: 'BDT 500 - [Standard Service]' },
  { value: 1000, label: 'BDT 1000 - [Premium Service]' },
];

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
  const [receivers, setReceivers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        receivedDate: initialValues.receivedDate ? dayjs(initialValues.receivedDate) : dayjs()
      };
      form.setFieldsValue(values);
      
      if (initialValues.customerId) {
        const customer = customers.find(c => c.id === initialValues.customerId);
        setSelectedCustomer(customer);
      }
      
      if (initialValues.deviceId) {
        const device = devices.find(d => d.id === initialValues.deviceId);
        setSelectedDevice(device);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        receivedDate: dayjs(),
        status: 'PENDING',
        consultancyFee: 200, // Default fee
      });
      setSelectedCustomer(null);
      setSelectedDevice(null);
    }
  }, [initialValues, form, customers, devices]);

  const fetchData = async () => {
    try {
      const [inventoryRes, receiversRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/receivers'),
      ]);

      setInventoryItems(await inventoryRes.json());
      setReceivers(await receiversRes.json());
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    setSelectedDevice(null);
    form.setFieldsValue({ deviceId: undefined });
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    form.setFieldsValue({ 
      deviceId: device.id,
      deviceUniqueId: device.uniqueId 
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const submitValues = {
        ...values,
        receivedDate: values.receivedDate ? values.receivedDate.toISOString() : new Date().toISOString(),
        deviceUniqueId: selectedDevice?.uniqueId,
      };

      const url = initialValues
        ? `/api/tickets/${initialValues.id}`
        : '/api/tickets';
      const method = initialValues ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitValues),
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
    <>
      <Modal
        title={initialValues ? 'Edit Ticket' : 'Create Ticket'}
        open={visible}
        onOk={handleSubmit}
        onCancel={onClose}
        confirmLoading={loading}
        width={950}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="receivedDate"
                label="Received Date"
                rules={[{ required: true, message: 'Please select received date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD MMM YYYY hh:mm A"
                  showTime={{
                    format: 'hh:mm A', // 12-hour format with AM/PM
                    use12Hours: true, // Enable 12-hour format
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select placeholder="Select status">
                  <Option value="RECEIVED">Received</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="NOT_REPAIRABLE">Not Repairable</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="READY_TO_DELIVER">Ready to Deliver</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="consultancyFee"
                label="Consultancy Fee"
                rules={[{ required: true, message: 'Please select consultancy fee!' }]}
              >
                <Select placeholder="Select fee">
                  {consultancyFeeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer!' }]}
              >
                <Select 
                  placeholder="Select customer"
                  onChange={handleCustomerChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deviceId"
                label="Device"
                rules={[{ required: true, message: 'Please select a device!' }]}
              >
                <div className="flex gap-2">
                  <Input 
                    value={selectedDevice ? 
                      `${selectedDevice.brand} ${selectedDevice.model} (${selectedDevice.serialNumber})` : 
                      'No device selected'
                    }
                    readOnly 
                    placeholder="Select a device"
                  />
                  <Button 
                    type="primary" 
                    onClick={() => setShowDeviceModal(true)}
                    disabled={!selectedCustomer}
                  >
                    Browse Devices
                  </Button>
                </div>
                {selectedDevice?.uniqueId && (
                  <div className="mt-1">
                    <Tag color="blue">Unique ID: {selectedDevice.uniqueId}</Tag>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* Customer Contact Information */}
          {selectedCustomer && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Phone Number">
                  <Input 
                    value={selectedCustomer.phone || 'N/A'} 
                    readOnly 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Address">
                  <Input.TextArea 
                    value={selectedCustomer.address || 'N/A'} 
                    readOnly 
                    rows={2}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivedById"
                label="Received By"
                rules={[{ required: true, message: 'Please select who received the device!' }]}
              >
                <Select placeholder="Select receiver">
                  {receivers.map(receiver => (
                    <Option key={receiver.id} value={receiver.id}>
                      {receiver.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description/Issue"
            rules={[{ required: true, message: 'Please input description/issue!' }]}
          >
            <TextArea rows={3} placeholder='Describe the issue reported by the customer'/>
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="Initial Diagnosis"
          >
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <DeviceSelectionModal
        visible={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        onSelect={handleDeviceSelect}
        customerId={selectedCustomer?.id}
      />
    </>
  );
}