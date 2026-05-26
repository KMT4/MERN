import api from './axios';

export interface MonthlySummaryItem {
  _id: 'income' | 'expense';
  total: number;
}

export const getMonthlySummary = async (): Promise<MonthlySummaryItem[]> => {
  const { data } = await api.get('/analytics/monthly-summary');
  return data;
};

export interface CategoryBreakdownItem {
  _id: string;
  total: number;
}

export const getCategoryBreakdown = async (): Promise<CategoryBreakdownItem[]> => {
  const { data } = await api.get('/analytics/category-breakdown');
  return data;
};

export interface Balance {
  income: number;
  expense: number;
  balance: number;
}

export const getBalance = async ( ) => {
  const { data } = await api.get('/analytics/balance');
  return data;
};
