import api from './axios';

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  exceeded: boolean;
  alertThreshold: number;
  thresholdAmount: number;
  nearLimit: boolean;
  alertTriggered: boolean;
  _id?: string; 
}

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  exceeded: boolean;
  nearLimit: boolean;
  alertThreshold: number;
  thresholdAmount: number;
}

export const getBudgetStatus = async (): Promise<BudgetStatus[]> => {
  const { data } = await api.get('/budgets/status');
  return data;
};

export const getBudgetAlerts = async () => {
  const { data } = await api.get('/budgets/alerts');
  return data;
};

export const createBudget = async (budgetData: {
  category: string;
  limit: number;
  month: string;
  alertThreshold?: number;
}) => {
  const { data } = await api.post('/budgets', budgetData);
  return data;
};

export const updateBudget = async (id: string, updates: {
  category?: string;
  limit?: number;
  month?: string;
  alertThreshold?: number;
}) => {
  const { data } = await api.put(`/budgets/${id}`, updates);
  return data;
};

export const deleteBudget = async (id: string) => {
  const { data } = await api.delete(`/budgets/${id}`);
  return data;
};