import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Form, Input, Button, Alert, Divider, Typography, Descriptions, Tag, Spin } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface TicketDetails {
  id: string;
  status: string;
  customerName: string;
  device: string;
  description: string;
  diagnosis?: string;
  receivedDate: string;
  technician?: string;
  estimatedCompletion?: string;
}

export default function Tracking() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (values: { ticketId: string }) => {
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await fetch(`/api/tickets/${values.ticketId}/public`);
      if (response.ok) {
        const ticketData = await response.json();
        setTicket(ticketData);
      } else {
        setError('Ticket not found. Please check your ticket number.');
      }
    } catch (error) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'blue';
      case 'PENDING': return 'orange';
      case 'IN_PROGRESS': return 'geekblue';
      case 'READY_TO_DELIVER': return 'cyan';
      case 'COMPLETED': return 'green';
      case 'NOT_REPAIRABLE': return 'volcano';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2}>Track Your Repair</Title>
          <Text type="secondary">
            Enter your ticket number to check the status of your device repair
          </Text>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <Form
            form={form}
            onFinish={handleSearch}
            layout="vertical"
            className="max-w-md mx-auto"
          >
            <Form.Item
              name="ticketId"
              label="Ticket Number"
              rules={[
                { required: true, message: 'Please enter your ticket number' },
                { pattern: /^TKT-\d+$/, message: 'Please enter a valid ticket number (e.g., TKT-001)' }
              ]}
            >
              <Input
                placeholder="Enter your ticket number (e.g., TKT-001)"
                prefix={<SearchOutlined />}
                size="large"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<EyeOutlined />}
                size="large"
                block
              >
                Track Repair
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Results */}
        {ticket && (
          <Card title="Repair Status" className="mb-6">
            <Spin spinning={loading}>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Ticket Number">
                  <Text strong>{ticket.id}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(ticket.status)} className="text-sm">
                    {ticket.status.replace(/_/g, ' ')}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Customer">
                  {ticket.customerName}
                </Descriptions.Item>

                <Descriptions.Item label="Device">
                  {ticket.device}
                </Descriptions.Item>

                <Descriptions.Item label="Problem Description">
                  {ticket.description}
                </Descriptions.Item>

                {ticket.diagnosis && (
                  <Descriptions.Item label="Diagnosis">
                    {ticket.diagnosis}
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Received Date">
                  {new Date(ticket.receivedDate).toLocaleDateString()}
                </Descriptions.Item>

                {ticket.technician && (
                  <Descriptions.Item label="Assigned Technician">
                    {ticket.technician}
                  </Descriptions.Item>
                )}

                {ticket.estimatedCompletion && (
                  <Descriptions.Item label="Estimated Completion">
                    {new Date(ticket.estimatedCompletion).toLocaleDateString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Spin>
          </Card>
        )}

        {/* Information */}
        <Card>
          <Title level={4}>How to Use</Title>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Enter your ticket number in the format TKT-001, TKT-002, etc.</li>
            <li>Your ticket number was provided when you submitted your device for repair</li>
            <li>If you've lost your ticket number, please contact our support team</li>
            <li>This system shows real-time status updates of your repair</li>
          </ul>

          <Divider />

          <Title level={4}>Status Meanings</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Tag color="blue">RECEIVED</Tag> - Device received at our facility
            </div>
            <div>
              <Tag color="orange">PENDING</Tag> - Waiting for technician assignment
            </div>
            <div>
              <Tag color="geekblue">IN_PROGRESS</Tag> - Repair work in progress
            </div>
            <div>
              <Tag color="cyan">READY_TO_DELIVER</Tag> - Repair completed, ready for pickup
            </div>
            <div>
              <Tag color="green">COMPLETED</Tag> - Device returned to customer
            </div>
            <div>
              <Tag color="volcano">NOT_REPAIRABLE</Tag> - Device cannot be repaired
            </div>
            <div>
              <Tag color="red">CANCELLED</Tag> - Repair request cancelled
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}