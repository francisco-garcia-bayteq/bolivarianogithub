export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'transfer'
  | 'services'
  | 'health';

export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
}
