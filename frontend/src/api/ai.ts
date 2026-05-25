import api from './axios';

export interface Insight {
  type: 'warning' | 'prediction' | 'tip' | 'goal';
  message: string;
  category?: string;
  severity?: 'high' | 'medium';
  potentialSaving?: number;
  daysLeft?: number;
}

export interface AIResponse {
  success: boolean;
  insights: Insight[];
  cached: boolean;
  generatedAt: string;
}

export const getInsights = async (force = false): Promise<AIResponse> => {
  const { data } = await api.get('/ai/financial-insights', {
    params: force ? { force: 'true' } : undefined,
  });
  return data;
};