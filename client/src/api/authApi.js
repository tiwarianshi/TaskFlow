import api from "./axiosInstance";

function normalizeAuthResponse(data) {
  if (data?.user && data?.token) {
    return data;
  }

  const { token, ...user } = data;
  return { user, token };
}

// Login user
export async function loginUser(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return normalizeAuthResponse(response.data);
}

// Register user
export async function registerUser(name, email, password) {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return normalizeAuthResponse(response.data);
}

export async function updateProfile(profileData) {
  const response = await api.put("/auth/profile", profileData);

  return response.data;
}

export async function changePassword(passwordData) {
  const response = await api.put("/auth/password", passwordData);

  return response.data;
}
