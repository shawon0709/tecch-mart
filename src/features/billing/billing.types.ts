export interface Invoice {
  id: string;
  ticketId: string;
  customerId: string;
  amount: number;
  date: string;
  status: 'PAID' | 'UNPAID' | 'CANCELLED';
}