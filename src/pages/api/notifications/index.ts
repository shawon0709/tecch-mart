import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      res.status(200).json(db.notifications || []);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const newNotification = {
        id: Date.now().toString(),
        ...req.body,
        read: false,
        createdAt: new Date().toISOString()
      };

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift(newNotification);

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}