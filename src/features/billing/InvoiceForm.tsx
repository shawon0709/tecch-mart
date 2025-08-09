import { useState } from 'react';
import { Modal, Button, Descriptions, Divider, Typography, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { Ticket } from '../repairs/ticket.types';

const { Text } = Typography;

interface InvoiceFormProps {
  visible: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  customer: any;
  technician: any;
  device: any;
  inventoryItems: any[];
}

export default function InvoiceForm({
  visible,
  onClose,
  ticket,
  customer,
  technician,
  device,
  inventoryItems,
}: InvoiceFormProps) {
  const handlePrint = () => {
    // In a real app, this would generate a PDF or open a print dialog
    message.info('Printing invoice...');
  };

  if (!ticket) return null;

  return (
    <Modal
      title={`Invoice for Ticket #${ticket.id}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print Invoice
        </Button>,
      ]}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Customer">{customer?.name}</Descriptions.Item>
        <Descriptions.Item label="Date">{new Date(ticket.createdAt || '').toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Technician">{technician?.name}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Text strong>{ticket.status}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Device Information</Divider>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Brand">{device?.brand}</Descriptions.Item>
        <Descriptions.Item label="Model">{device?.model}</Descriptions.Item>
        <Descriptions.Item label="Serial Number">{device?.serialNumber}</Descriptions.Item>
        <Descriptions.Item label="Problem">{device?.problem}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Repair Details</Divider>
      <div className="mb-4">
        <Text strong>Description:</Text>
        <p>{ticket.description}</p>
      </div>
      <div className="mb-4">
        <Text strong>Diagnosis:</Text>
        <p>{ticket.diagnosis || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <Text strong>Report:</Text>
        <p>{ticket.report || 'N/A'}</p>
      </div>

      <Divider orientation="left">Parts Used</Divider>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventoryItems.map(item => (
            <tr key={item.id} className="border">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider />

      <div className="text-right">
        <Text strong className="text-lg">
          Total: ${ticket.invoiceTotal?.toFixed(2) || '0.00'}
        </Text>
      </div>
    </Modal>
  );
}