import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all inventory items
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    return res.status(200).json(db.inventoryItems);
  } else if (req.method === 'POST') {
    // Add new inventory item
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const newItem = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.inventoryItems.push(newItem);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(201).json(newItem);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}