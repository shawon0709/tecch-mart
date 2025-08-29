import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    return res.status(200).json(db.receivers || []);
  } else if (req.method === 'POST') {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const newReceiver = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (!db.receivers) db.receivers = [];
    db.receivers.push(newReceiver);
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(201).json(newReceiver);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}