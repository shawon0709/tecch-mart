import { useEffect } from 'react';
import { Button, Card, Divider, Typography, Row, Col, Descriptions } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Ticket } from '../repairs/ticket.types';
import { formatDateTime } from '../../lib/dateUtils';

const { Title, Text } = Typography;

interface InvoiceTemplateProps {
  ticket: Ticket;
  customer: any;
  device: any;
  technician: any;
  receiver: any;
  inventoryItems?: any[];
  onClose?: () => void;
}

export default function InvoiceTemplate({
  ticket,
  customer,
  device,
  technician,
  receiver,
  inventoryItems = [],
  onClose
}: InvoiceTemplateProps) {
  useEffect(() => {
    // Auto-print when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  // Calculate totals
  const subtotal = ticket.consultancyFee || 0;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return (
    <div className="p-6 bg-white">
      {/* Action buttons - hidden when printing */}
      <div className="no-print mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint}>
              Print Bill
            </Button>
          </Col>
          <Col>
            <Button onClick={onClose}>Close</Button>
          </Col>
        </Row>
      </div>

      {/* Printable Invoice */}
      <Card className="printable-invoice">
        {/* Header */}
<Row gutter={16} className="mb-6">
  {/* Left column (logo, spans all rows) */}
  <Col span={4} className="flex items-center justify-center">
    <img
      src="/images/tm-hexagon.png"
      alt="Company Logo"
      style={{ width: 70, height: 70, objectFit: 'contain' }}
    />
  </Col>

  {/* Right column (company details) */}
  <Col span={20}>
    <Row>
      <Col span={24}>
        <Title level={2} className="m-0">Tech Mart</Title>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Text>123 Repair Street, Tech City</Text>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Text>Phone: +91 9876543210 | Email: info@itrepairshop.com</Text>
      </Col>
    </Row>
  </Col>
</Row>

{/* Invoice details row */}
<Row justify="end" className="mb-6">
  <Col>
    <Title level={3} className="m-0 text-right">INVOICE</Title>
    <Text className="text-right">#{ticket.id}</Text>
    <br />
    <Text className="text-right">
      Date: {formatDateTime(ticket.receivedDate || ticket.createdAt || '')}
    </Text>
  </Col>
</Row>

        <Divider />

        {/* Customer and Device Information */}
        <Row gutter={24} className="mb-6">
          <Col span={12}>
            <Card size="small" title="Customer Information">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">{customer?.name}</Descriptions.Item>
                <Descriptions.Item label="Phone">{customer?.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{customer?.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address">{customer?.address || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Device Information">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Device">{device?.brand} {device?.model}</Descriptions.Item>
                <Descriptions.Item label="Serial No.">{device?.serialNumber}</Descriptions.Item>
                <Descriptions.Item label="Unique ID">{device?.uniqueId}</Descriptions.Item>
                <Descriptions.Item label="Issue">{ticket.description}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Service Details */}
        <Card size="small" title="Service Details" className="mb-6">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Technician">{technician?.name}</Descriptions.Item>
            <Descriptions.Item label="Received By">{receiver?.name}</Descriptions.Item>
            <Descriptions.Item label="Received Date">
              {formatDateTime(ticket.receivedDate || ticket.createdAt || '')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Text strong>{ticket.status}</Text>
            </Descriptions.Item>
            {ticket.diagnosis && (
              <Descriptions.Item label="Diagnosis" span={2}>
                {ticket.diagnosis}
              </Descriptions.Item>
            )}
            {ticket.report && (
              <Descriptions.Item label="Solution" span={2}>
                {ticket.report}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Billing Details */}
        <Card size="small" title="Billing Details">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Description</th>
                <th className="p-2 border text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className="p-2 border">Consultancy Fee</td>
                <td className="p-2 border text-right">{ticket.consultancyFee?.toFixed(2)}</td>
              </tr>
              
              {/* Add parts/items if needed */}
              {inventoryItems.map((item, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">{item.name} (Qty: {item.quantity})</td>
                  <td className="p-2 border text-right">{item.price?.toFixed(2)}</td>
                </tr>
              ))}
              
              <tr className="border">
                <td className="p-2 border">GST (18%)</td>
                <td className="p-2 border text-right">{tax.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="p-2 border">Total Amount</td>
                <td className="p-2 border text-right">BDT {total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Terms and Conditions */}
        <div className="mt-8 text-xs text-gray-600">
          <Divider />
          <Text strong>Terms & Conditions:</Text>
          <ul className="pl-4 mt-2">
            <li>Payment due upon receipt of this invoice</li>
            <li>Warranty: 30 days on labor, 90 days on parts</li>
            <li>Data backup is customer's responsibility</li>
            <li>Unclaimed devices will be disposed after 60 days</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Text className="text-sm">Thank you for your business!</Text>
          <br />
          <Text className="text-xs text-gray-500">
            Authorized Signature: _________________________
          </Text>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .printable-invoice {
            border: none !important;
            box-shadow: none !important;
          }
          .ant-card {
            border: 1px solid #000 !important;
          }
        }
        
        .printable-invoice {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
        }
      `}</style>
    </div>
  );
}