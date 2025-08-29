export interface DeviceHistory {
  id?: string;
  deviceId: string;
  deviceUniqueId?: string;
  ticketId: string;
  customerId: string;
  technicianId: string;
  problemDescription: string;
  diagnosis?: string;
  solution?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  consultancyFee?: number;
  totalCost?: number;
  receivedDate: string;
  completedDate?: string;
  createdAt?: string;
}

export interface DeviceWithHistory {
  device: any;
  history: DeviceHistory[];
  totalRepairs: number;
  totalRevenue: number;
}