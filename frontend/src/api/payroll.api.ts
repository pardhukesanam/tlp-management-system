import { api } from "./client";

export const getPayrolls = async () => {
  const response = await api.get("/payrolls");
  return response.data;
};

export const getMyPayrolls = async () => {
  const response = await api.get("/payrolls/my");
  return response.data;
};

export const approvePayroll = async (
  payrollId: string
) => {
  const response = await api.put(
    `/payrolls/${payrollId}/approve`
  );

  return response.data;
};

export const markPayrollPaid = async (
  payrollId: string
) => {
  const response = await api.put(
    `/payrolls/${payrollId}/pay`
  );

  return response.data;
};