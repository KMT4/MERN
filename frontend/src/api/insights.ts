import api from './axios';

export interface SpendingInsightsSummary {
  totalExpenses: number;
  topSpendingCategory: string | null;
  topCategoryAmount: number;
}

export interface SpendingInsights {
  success: boolean;
  summary: SpendingInsightsSummary;
  topSpendingCategories: { _id: string; total: number }[];
}

export const getSpendingInsights = async (): Promise<SpendingInsights> => {
  const { data } = await api.get('/insights/spending-insights');
  return data;
};

export interface RecurringInsight {
  category: string;
  type: string;
  amount: number;
  recurrenceCount: number;
  likelyRecurring: boolean;
}

export interface RecurringResponse {
  success: boolean;
  recurringPatternsFound: number;
  insights: RecurringInsight[];
}

export const getRecurringTransactions = async (): Promise<RecurringResponse> => {
  const { data } = await api.get('/insights/recurring-transactions');
  return data;
};