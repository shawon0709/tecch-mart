import { useState, useEffect } from 'react';
import { Modal, Spin, message, Empty, Alert } from 'antd';
import InvoiceTemplate from './InvoiceTemplate';
import { Ticket } from '../repairs/ticket.types';

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  ticketId: string;
}

interface TicketItem {
  id: string;
  ticketId: string;
  inventoryItemId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export default function InvoiceModal({ visible, onClose, ticketId }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);
  const [technician, setTechnician] = useState<any>(null);
  const [receiver, setReceiver] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<TicketItem[]>([]);
  const [hasData, setHasData] = useState(false);
  const [missingData, setMissingData] = useState<string[]>([]);

  const fetchInvoiceData = async () => {
    if (!ticketId) {
      message.error('No ticket ID provided');
      return;
    }
    
    setLoading(true);
    setHasData(false);
    setMissingData([]);
    
    try {
      // Fetch all data in parallel
      const [ticketRes, customersRes, devicesRes, techniciansRes, receiversRes] = await Promise.all([
        fetch(`/api/tickets/${ticketId}`),
        fetch('/api/customers'),
        fetch('/api/devices'),
        fetch('/api/technicians'),
        fetch('/api/receivers'),
      ]);

      // Check if ticket request was successful
      if (!ticketRes.ok) {
        throw new Error(`Failed to fetch ticket: ${ticketRes.status}`);
      }

      const ticketData: Ticket = await ticketRes.json();
      const customersData = await customersRes.json();
      const devicesData = await devicesRes.json();
      const techniciansData = await techniciansRes.json();
      const receiversData = await receiversRes.json();

      console.log('Fetched data:', {
        ticket: ticketData,
        customers: customersData,
        devices: devicesData,
        technicians: techniciansData,
        receivers: receiversData
      });

      // Find related data and track what's missing
      const missing: string[] = [];
      const customerData = customersData.find((c: any) => c.id === ticketData.customerId);
      const deviceData = devicesData.find((d: any) => d.id === ticketData.deviceId);
      const technicianData = techniciansData.find((t: any) => t.id === ticketData.technicianId);
      const receiverData = receiversData.find((r: any) => r.id === ticketData.receivedById);

      if (!customerData) missing.push(`Customer (ID: ${ticketData.customerId})`);
      if (!deviceData) missing.push(`Device (ID: ${ticketData.deviceId})`);
      if (!technicianData) missing.push(`Technician (ID: ${ticketData.technicianId})`);
      if (!receiverData) missing.push(`Receiver (ID: ${ticketData.receivedById})`);

      if (missing.length > 0) {
        setMissingData(missing);
        throw new Error(`Missing related data: ${missing.join(', ')}`);
      }

      setTicket(ticketData);
      setCustomer(customerData);
      setDevice(deviceData);
      setTechnician(technicianData);
      setReceiver(receiverData);
      setHasData(true);

      // Try to fetch inventory items (optional)
      try {
        const itemsRes = await fetch(`/api/tickets/${ticketId}/items`);
        if (itemsRes.ok) {
          const ticketItems: TicketItem[] = await itemsRes.json();
          setInventoryItems(ticketItems);
        }
      } catch (error) {
        console.log('Ticket items API not available');
      }

    } catch (error) {
      console.error('Error fetching invoice data:', error);
      message.error('Failed to load complete invoice data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && ticketId) {
      fetchInvoiceData();
    } else {
      // Reset state when modal closes
      setTicket(null);
      setCustomer(null);
      setDevice(null);
      setTechnician(null);
      setReceiver(null);
      setInventoryItems([]);
      setHasData(false);
      setMissingData([]);
    }
  }, [visible, ticketId]);

  return (
    <Modal
      title="Print Invoice"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200 }}
      className="invoice-modal"
    >
      <Spin spinning={loading}>
        {missingData.length > 0 && (
          <Alert
            type="error"
            message="Missing Data"
            description={
              <div>
                <p>The following related data could not be found:</p>
                <ul>
                  {missingData.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p>Please check your database records.</p>
              </div>
            }
            className="mb-4"
          />
        )}
        
        {hasData && ticket && customer && device && technician && receiver ? (
          <InvoiceTemplate
            ticket={ticket}
            customer={customer}
            device={device}
            technician={technician}
            receiver={receiver}
            inventoryItems={inventoryItems}
            onClose={onClose}
          />
        ) : (
          !loading && missingData.length === 0 && (
            <Empty
              description={
                "Loading invoice data..."
              }
            />
          )
        )}
      </Spin>
    </Modal>
  );
}