import { api } from "./client";

export const getTodayWorkLog = async () => {
  const response = await api.get("/timesheets/today");
  return response.data;
};

export const addActivity = async (
  timeEntryId: string,
  data: {
    startTime: string;
    endTime: string;
    activity: string;
    activityType: string;
  }
) => {
  const response = await api.post(
    `/timesheets/${timeEntryId}/activities`,
    data
  );

  return response.data;
};

export const deleteActivity = async (
  activityId: string
) => {
  const response = await api.delete(
    `/timesheets/activities/${activityId}`
  );

  return response.data;
};

export const updateActivity = async (
  activityId: string,
  data: {
    startTime: string;
    endTime: string;
    activity: string;
    activityType: string;
  }
) => {
  const response = await api.put(
    `/timesheets/activities/${activityId}`,
    data
  );

  return response.data;
};

export const submitWorkLog = async (
  timeEntryId: string
) => {
  const response = await api.put(
    `/timesheets/${timeEntryId}/submit`
  );

  return response.data;
};

export const getPendingWorkLogs = async () => {
  const response = await api.get("/timesheets/pending");
  return response.data;
};

export const getWorkLogById = async (
  id: string
) => {
  const response = await api.get(`/timesheets/${id}`);
  return response.data;
};