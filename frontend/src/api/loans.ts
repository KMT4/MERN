import api from './axios';

export interface Loan {
  _id: string;
  userId: string;
  lender: string;
  amountBorrowed: number;
  amountRemaining: number;
  interestRate?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanSummary {
  totalBorrowed: number;
  totalRemaining: number;
  outstandingLoans: number;
  overdueLoans: number;
}

export const getLoans = async (): Promise<{ success: boolean; count: number; loans: Loan[] }> => {
  const { data } = await api.get('/loans');
  return data;
};

export const getLoanSummary = async (): Promise<{ success: boolean; summary: LoanSummary }> => {
  const { data } = await api.get('/loans/summary');
  return data;
};

export const createLoan = async (loanData: {
  lender: string;
  amountBorrowed: number;
  interestRate?: number;
  dueDate?: string;
}): Promise<{ success: boolean; loan: Loan }> => {
  const { data } = await api.post('/loans', loanData);
  return data;
};

export const updateLoan = async (id: string, updates: Partial<Loan>): Promise<{ success: boolean; loan: Loan }> => {
  const { data } = await api.put(`/loans/${id}`, updates);
  return data;
};

export const deleteLoan = async (id: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/loans/${id}`);
  return data;
};