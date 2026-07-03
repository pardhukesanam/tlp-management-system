import { api } from "./client";

export const getMyLeaves = async () => {
  const response = await api.get("/leaves/my-leaves");
  return response.data;
};

export const createLeave = async (data: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}) => {
  const response = await api.post("/leaves", data);
  return response.data;
};

export const cancelLeave = async (leaveId: string) => {
  const response = await api.put(`/leaves/${leaveId}/cancel`);
  return response.data;
};