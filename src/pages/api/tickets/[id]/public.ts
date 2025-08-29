import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src','data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Find the ticket
    const ticket = db.tickets.find((t: any) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find related data
    const customer = db.customers.find((c: any) => c.id === ticket.customerId);
    const device = db.devices.find((d: any) => d.id === ticket.deviceId);
    const technician = db.technicians.find((t: any) => t.id === ticket.technicianId);

    // Return public-facing data only (no sensitive information)
    const publicTicket = {
      id: ticket.id,
      status: ticket.status,
      customerName: customer?.name || 'Unknown',
      device: device ? `${device.brand} ${device.model}` : 'Unknown Device',
      description: ticket.description,
      diagnosis: ticket.diagnosis,
      receivedDate: ticket.receivedDate || ticket.createdAt,
      technician: technician?.name,
      estimatedCompletion: ticket.estimatedCompletion,
    };

    return res.status(200).json(publicTicket);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}