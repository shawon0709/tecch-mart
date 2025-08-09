import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  if (req.method === 'PUT') {
    const index = db.suppliers.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const updatedSupplier = {
      ...db.suppliers[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.suppliers[index] = updatedSupplier;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json(updatedSupplier);
  } else if (req.method === 'DELETE') {
    const index = db.suppliers.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    db.suppliers.splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(204).end();
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}