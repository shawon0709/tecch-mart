import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      
      // Get device
      const device = db.devices.find((d: any) => d.id === id);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      // Get all tickets for this device
      const deviceTickets = db.tickets.filter((t: any) => t.deviceId === id);
      
      // Transform tickets into history format
      const history = deviceTickets.map((ticket: any) => {
        const technician = db.technicians.find((tech: any) => tech.id === ticket.technicianId);
        const customer = db.customers.find((c: any) => c.id === ticket.customerId);
        
        return {
          id: ticket.id,
          deviceId: ticket.deviceId,
          deviceUniqueId: device.uniqueId,
          ticketId: ticket.id,
          customerId: ticket.customerId,
          customerName: customer?.name,
          technicianId: ticket.technicianId,
          technicianName: technician?.name,
          problemDescription: ticket.description,
          diagnosis: ticket.diagnosis,
          solution: ticket.report,
          status: ticket.status,
          consultancyFee: ticket.consultancyFee,
          totalCost: ticket.invoiceTotal,
          receivedDate: ticket.receivedDate || ticket.createdAt,
          completedDate: ticket.status === 'COMPLETED' ? ticket.updatedAt : undefined,
          createdAt: ticket.createdAt
        };
      });

      // Calculate totals
      const totalRepairs = history.length;
      const totalRevenue = history
        .filter((h: any) => h.status === 'COMPLETED')
        .reduce((sum: number, h: any) => sum + (h.totalCost || 0), 0);

      const response: any = {
        device,
        history: history.sort((a: any, b: any) => 
          new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
        ),
        totalRepairs,
        totalRevenue,
        customer: db.customers.find((c: any) => c.id === device.customerId)
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}