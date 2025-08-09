import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const user = db.users.find((u: any) => u.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}