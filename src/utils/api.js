const API_BASE_URL = "http://localhost:5001/api";

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getHeaders(!options.body || typeof options.body === "string"), ...options.headers };
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An error occurred during request execution");
  }

  return data;
}

export const api = {
  // Auth & Profile API
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password, mobile = "") =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, mobile })
    }),

  getProfile: () =>
    request("/auth/profile", { method: "GET" }),

  updateProfile: (profileData) =>
    request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    }),

  verifyEmail: (email, otp) =>
    request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp })
    }),

  changePassword: (oldPassword, newPassword) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword })
    }),

  // Address CRUD API
  getAddresses: () => request("/auth/addresses"),

  addAddress: (addressData) =>
    request("/auth/addresses", {
      method: "POST",
      body: JSON.stringify(addressData)
    }),

  updateAddress: (id, addressData) =>
    request(`/auth/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressData)
    }),

  deleteAddress: (id) =>
    request(`/auth/addresses/${id}`, {
      method: "DELETE"
    }),

  setDefaultAddress: (id) =>
    request(`/auth/addresses/${id}/default`, {
      method: "PUT"
    }),

  // Products API
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : "?limit=50"}`);
  },

  getFeaturedProducts: () => request("/products/featured"),

  getBestSellers: () => request("/products/best-sellers"),

  getProductById: (id) => request(`/products/details/${id}`),

  getProductsByCategory: (categoryId) => request(`/products/category/${categoryId}`),

  // Categories API
  getCategories: () => request("/categories"),

  // Cart API
  getCart: () => request("/cart"),

  addToCart: (productId, quantity = 1) =>
    request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    }),

  updateCartItem: (productId, quantity) =>
    request("/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity })
    }),

  removeFromCart: (productId, variant = null) =>
    request("/cart/remove", {
      method: "POST",
      body: JSON.stringify({ productId, variant, removeAll: true })
    }),

  clearCart: () => request("/cart", { method: "DELETE" }),

  // Wishlist API
  getWishlist: () => request("/auth/wishlist"),

  toggleWishlist: (productId) =>
    request("/auth/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId })
    }),

  addToWishlist: (productId) =>
    request("/auth/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId })
    }),

  removeFromWishlist: (productId) =>
    request("/auth/wishlist/remove", {
      method: "POST",
      body: JSON.stringify({ productId })
    }),

  // Orders API
  checkoutOrder: (orderPayload) =>
    request("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(orderPayload)
    }),

  getOrders: () => request("/orders"),

  getOrderById: (id) => request(`/orders/${id}`),

  // Coupons API
  getCoupons: () => request("/coupons")
};

export default api;
