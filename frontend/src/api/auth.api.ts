import { api } from "./client";

export const loginUser = async (
  email: string,
  password: string
) => {

  const response =
    await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.post(
    "/auth/change-password",
    {
      currentPassword,
      newPassword,
    }
  );

  return response.data;
};