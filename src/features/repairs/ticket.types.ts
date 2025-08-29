export interface Device {
  id?: string;
  uniqueId?: string; 
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
  receivedById: string;
  deviceId: string;
  deviceUniqueId?: string;
  description: string;
  diagnosis?: string;
  status: 'RECEIVED' | 'PENDING' | 'NOT_REPAIRABLE' | 'IN_PROGRESS' | 'READY_TO_DELIVER' | 'COMPLETED' | 'CANCELLED';
  report?: string;
  timeline?: string;
  consultancyFee?: number;
  invoiceTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  receivedDate?: string;
}