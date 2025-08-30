import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    const notifications: any[] = [];

    // 1. Low stock alerts
    const lowStockItems = db.inventoryItems?.filter((item: any) => 
      item.quantity <= item.reorderLevel
    ) || [];

    lowStockItems.forEach((item: any) => {
      notifications.push({
        id: `low-stock-${item.id}`,
        type: 'WARNING',
        title: 'Low Stock Alert',
        message: `${item.name} is running low (${item.quantity} items left, reorder at ${item.reorderLevel})`,
        read: false,
        createdAt: new Date().toISOString(),
        link: '/inventory'
      });
    });

    // 2. Overdue tickets (more than 7 days old and not completed)
    const overdueTickets = db.tickets?.filter((ticket: any) => {
      if (ticket.status === 'COMPLETED' || ticket.status === 'CANCELLED') return false;
      
      const createdDate = new Date(ticket.createdAt || ticket.receivedDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
      
      return daysDiff > 7;
    }) || [];

    overdueTickets.forEach((ticket: any) => {
      const customer = db.customers?.find((c: any) => c.id === ticket.customerId);
      notifications.push({
        id: `overdue-${ticket.id}`,
        type: 'URGENT',
        title: 'Overdue Repair Ticket',
        message: `Ticket ${ticket.id} for ${customer?.name || 'customer'} is overdue`,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/tickets/${ticket.id}`
      });
    });

    // 3. High priority tickets (pending for more than 3 days)
    const highPriorityTickets = db.tickets?.filter((ticket: any) => {
      if (ticket.status !== 'PENDING') return false;
      
      const createdDate = new Date(ticket.createdAt || ticket.receivedDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
      
      return daysDiff > 3;
    }) || [];

    highPriorityTickets.forEach((ticket: any) => {
      const customer = db.customers?.find((c: any) => c.id === ticket.customerId);
      notifications.push({
        id: `priority-${ticket.id}`,
        type: 'WARNING',
        title: 'High Priority Ticket',
        message: `Ticket ${ticket.id} has been pending for over 3 days`,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/tickets/${ticket.id}`
      });
    });

    // 4. Recently completed tickets (last 24 hours)
    const recentCompletedTickets = db.tickets?.filter((ticket: any) => {
      if (ticket.status !== 'COMPLETED') return false;
      
      const completedDate = new Date(ticket.updatedAt || ticket.createdAt);
      const now = new Date();
      const hoursDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 3600));
      
      return hoursDiff <= 24;
    }) || [];

    recentCompletedTickets.forEach((ticket: any) => {
      const customer = db.customers?.find((c: any) => c.id === ticket.customerId);
      notifications.push({
        id: `completed-${ticket.id}`,
        type: 'SUCCESS',
        title: 'Repair Completed',
        message: `Ticket ${ticket.id} for ${customer?.name || 'customer'} has been completed`,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/tickets/${ticket.id}`
      });
    });

    // 5. Devices without recent tickets (maybe abandoned)
    const activeDevices = new Set(db.tickets?.map((t: any) => t.deviceId) || []);
    const abandonedDevices = db.devices?.filter((device: any) => !activeDevices.has(device.id)) || [];

    abandonedDevices.forEach((device: any) => {
      const customer = db.customers?.find((c: any) => c.id === device.customerId);
      notifications.push({
        id: `abandoned-${device.id}`,
        type: 'INFO',
        title: 'Inactive Device',
        message: `${device.brand} ${device.model} has no recent repair tickets`,
        read: false,
        createdAt: new Date().toISOString(),
        link: '/devices'
      });
    });

    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(notifications);

  } catch (error) {
    console.error('Error analyzing database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}