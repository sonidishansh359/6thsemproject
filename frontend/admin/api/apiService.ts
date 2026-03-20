import { API_BASE_URL, getHeaders, handleResponse } from "./apiConfig";

// Auth APIs (Admin login is common)
export const apiService = {
  login: async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  // Food APIs (Admin)
  getFoods: async () => {
    const response = await fetch(`${API_BASE_URL}/api/foods`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  addFood: async (foodData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/foods`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(foodData),
    });
    return handleResponse(response);
  },

  deleteFood: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Order APIs (Admin)
  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
