import api from './axios';

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  currency: string;
  monthlyIncome: number;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/users/profile');
  return data.user;
};

export const updateUserProfile = async (
  updates: Partial<Pick<UserProfile, 'fullName' | 'email' | 'currency' | 'monthlyIncome'>>
): Promise<UserProfile> => {
  const { data } = await api.patch('/users/profile', updates);
  return data.user;
};

export const changeUserPassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.patch('/users/profile/password', passwords);
};