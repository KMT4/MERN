import api from "./axios";

export const getGoals = async () => {
  const res = await api.get("/goals");
  return res.data;
};

export const createGoal = async (data: {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string | null;
}) => {
  const res = await api.post("/goals", data);
  return res.data;
};

export const updateGoalProgress = async (
  goalId: string,
  amountToAdd: number,
) => {
  const res = await api.patch(`/goals/${goalId}/progress`, {
    amountToAdd,
  });

  return res.data;
};

export const deleteGoal = async (goalId: string) => {
  const res = await api.delete(`/goals/${goalId}`);
  return res.data;
};
