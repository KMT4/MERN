import api from "./axios";

// GET ALL INCOME
export const getIncome = async () => {
  const res = await api.get("/income");
  return res.data;
};

// CREATE INCOME
export const createIncome = async (data: {
  source: string;
  amount: number;
  date?: string;
}) => {
  const res = await api.post("/income", data);
  return res.data;
};

// DELETE INCOME
export const deleteIncome = async (id: string) => {
  const res = await api.delete(`/income/${id}`);
  return res.data;
};