import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  items: [],
  loading: false,
};

export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getWishlist();
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleWishlistThunk = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await api.toggleWishlist(productId);
      return data.wishlist;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const wishListSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishList: (state, action) => {
      const id = action.payload._id || action.payload.productID || action.payload.id;
      if (!state.items.some(item => (item._id || item.productID || item.id) === id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishList: (state, action) => {
      const id = action.payload._id || action.payload.productID || action.payload.id;
      state.items = state.items.filter((item) => (item._id || item.productID || item.id) !== id);
    },
    clearWishList: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      });
  }
});

export const { addToWishList, removeFromWishList, clearWishList } = wishListSlice.actions;

export default wishListSlice.reducer;
