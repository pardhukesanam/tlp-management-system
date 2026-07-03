import { api } from "./client";

export const getMyProfile = async () => {
  const response = await api.get("/employees/me");
  return response.data;
};