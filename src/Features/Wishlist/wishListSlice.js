import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const getInitialWishlist = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("vardaan_wishlist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

const saveWishlistToLocal = (items) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("vardaan_wishlist", JSON.stringify(items));
    }
  }
};

export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return getInitialWishlist();
      }
      const data = await api.getWishlist();
      if (data.success) {
        return data.data || [];
      }
      return getInitialWishlist();
    } catch (err) {
      return getInitialWishlist();
    }
  }
);

export const syncGuestWishlistThunk = createAsyncThunk(
  "wishlist/syncGuestWishlist",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window !== "undefined") {
        const localWishlist = localStorage.getItem("vardaan_wishlist");
        if (localWishlist) {
          const items = JSON.parse(localWishlist);
          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              const pId = item._id || item.productID || item.id;
              if (pId) {
                try {
                  await api.addToWishlist(pId);
                } catch (e) {
                  console.warn("Error syncing wishlist item to API:", e);
                }
              }
            }
            localStorage.removeItem("vardaan_wishlist");
          }
        }
      }
      const data = await api.getWishlist();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleWishlistThunk = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (product, { rejectWithValue }) => {
    try {
      const pId = product._id || product.productID || product.id;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (token && pId) {
        const data = await api.toggleWishlist(pId);
        return { product, wishlist: data.wishlist || data.data };
      }
      return { product, wishlist: null };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: getInitialWishlist(),
  loading: false,
};

const wishListSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishList: (state, action) => {
      const product = action.payload;
      const id = product._id || product.productID || product.id;
      if (!state.items.some((item) => (item._id || item.productID || item.id) === id)) {
        state.items.push(product);
      }
      saveWishlistToLocal(state.items);
    },
    removeFromWishList: (state, action) => {
      const product = action.payload;
      const id = typeof product === "string" ? product : (product._id || product.productID || product.id);
      state.items = state.items.filter((item) => (item._id || item.productID || item.id) !== id);
      saveWishlistToLocal(state.items);
    },
    clearWishList: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("vardaan_wishlist");
      }
    },
    setWishListItems: (state, action) => {
      state.items = action.payload || [];
      saveWishlistToLocal(state.items);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      })
      .addCase(syncGuestWishlistThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      });
  }
});

export const { addToWishList, removeFromWishList, clearWishList, setWishListItems } = wishListSlice.actions;

export default wishListSlice.reducer;

