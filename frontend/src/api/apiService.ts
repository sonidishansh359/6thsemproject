import { API_BASE_URL, getHeaders, handleResponse } from "./apiConfig";

// Auth APIs
export const authService = {
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

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

// User APIs
export const userService = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/user/update`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

// Food APIs
export const foodService = {
  getAllFoods: async () => {
    const response = await fetch(`${API_BASE_URL}/api/foods`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Admin food actions
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
};

// Order APIs
export const orderService = {
  placeOrder: async (orderData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  getUserOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getAllOrdersForAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
