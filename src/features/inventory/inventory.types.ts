export interface InventoryItem {
  id?: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  quantity: number;
  reorderLevel: number;
  supplierId: string;
  createdAt?: string;
  updatedAt?: string;
}