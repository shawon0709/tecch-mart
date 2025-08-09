export interface Device {
  id?: string;
  serialNumber: string;
  brand: string;
  model: string;
  description?: string;
  remarks?: string;
  problem?: string;
  problemType?: 'HARDWARE' | 'SOFTWARE' | 'OTHER';
  customerId: string;
  technicianId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  id?: string;
  customerId: string;
  technicianId: string;
  deviceId: string;
  description: string;
  diagnosis?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  report?: string;
  timeline?: string;
  invoiceTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}