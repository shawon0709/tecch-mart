import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

// Add this function at the top
const generateUniqueId = (device: any): string => {
  const brandCode = device.brand.substring(0, 4).toUpperCase();
  const modelCode = device.model.substring(0, 4).toUpperCase();
  const serialCode = device.serialNumber.substring(0, 4).toUpperCase();
  return `${brandCode}-${modelCode}-${serialCode}`;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  if (req.method === 'PUT') {
    const index = db.devices.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const deviceWithUniqueId = {
      ...db.devices[index],
      ...req.body,
      uniqueId: generateUniqueId({ ...db.devices[index], ...req.body }),
      updatedAt: new Date().toISOString(),
    };

    const updatedDevice = {
      ...db.devices[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.devices[index] = deviceWithUniqueId;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json(deviceWithUniqueId);
  } else if (req.method === 'DELETE') {
    const index = db.devices.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Device not found' });
    }

    db.devices.splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(204).end();
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}