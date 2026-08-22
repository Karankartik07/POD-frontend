const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return "http://localhost:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();

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

  loginMobile: (mobile) =>
    request("/auth/login-mobile", {
      method: "POST",
      body: JSON.stringify({ mobile })
    }),

  verifyMobileOtp: (mobile, otp) =>
    request("/auth/verify-mobile-otp", {
      method: "POST",
      body: JSON.stringify({ mobile, otp })
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

  cancelOrder: async (orderId, reason) => {
    try {
      return await request(`/orders/${orderId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason })
      });
    } catch (err) {
      return await request(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: "Cancelled", cancelReason: reason })
      });
    }
  },

  requestReturn: async (orderId, returnReason, type = "return") => {
    try {
      return await request(`/orders/${orderId}/return`, {
        method: "POST",
        body: JSON.stringify({ returnReason, requestType: type })
      });
    } catch (err) {
      const statusText = type === "replacement" ? "Replacement Requested" : "Return Requested";
      return await request(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: statusText, returnReason, requestType: type })
      });
    }
  },

  // Coupons API
  getCoupons: () => request("/coupons"),

  applyCoupon: (code, orderAmount) =>
    request("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, orderAmount })
    })
};

export default api;
