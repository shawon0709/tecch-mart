import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const ticketItems = db.ticketItems.filter((item: any) => item.ticketId === id);
      
      // Enrich with inventory item details
      const enrichedItems = ticketItems.map((item: any) => {
        const inventoryItem = db.inventoryItems.find((inv: any) => inv.id === item.inventoryItemId);
        return {
          ...item,
          ...inventoryItem,
          price: inventoryItem?.price || 0
        };
      });

      return res.status(200).json(enrichedItems);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}