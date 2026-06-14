import api from "./axiosInstance";

export async function getProfile() {
  const response = await api.get("/settings/profile");
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await api.put("/settings/profile", profileData);
  return response.data;
}

export async function changePassword(passwordData) {
  const response = await api.put("/settings/password", passwordData);
  return response.data;
}

export async function getPreferences() {
  const response = await api.get("/settings/preferences");
  return response.data;
}

export async function updatePreferences(preferencesData) {
  const response = await api.put("/settings/preferences", preferencesData);
  return response.data;
}

export default {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
};
