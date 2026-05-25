import api from './axios';

export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod?: string;
  autoCategorized?: boolean;
  categoryConfidence?: number;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch transactions, optionally filtered by type
export const getTransactions = async (type?: 'income' | 'expense'): Promise<Transaction[]> => {
  const { data } = await api.get('/transactions', {
    params: type ? { type } : undefined,
  });
  return data;
};

// Create a new transaction
export const createTransaction = async (
  transaction: Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date' | 'paymentMethod'> & { isRecurring?: boolean }
): Promise<Transaction> => {
  const { data } = await api.post('/transactions', transaction);
  return data;
};

// Update a transaction
export const updateTransaction = async (
  id: string,
  updates: Partial<Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date' | 'paymentMethod' | 'isRecurring'>>
): Promise<Transaction> => {
  const { data } = await api.put(`/transactions/${id}`, updates);
  return data;
};

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};