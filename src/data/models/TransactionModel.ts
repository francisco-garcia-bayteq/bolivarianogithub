export interface TransactionModel {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  userId: string;
  reference: string;
  metadata: Record<string, unknown> | null;
}
