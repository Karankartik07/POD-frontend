import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
};

const MAX_QUANTITY = 20;

export const fetchCartThunk = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getCart();
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const syncAddToCartThunk = createAsyncThunk(
  "cart/syncAddToCart",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const data = await api.addToCart(productId, quantity);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const id = product._id || product.productID || product.id;
      const existingItem = state.items.find(
        (item) => (item._id || item.productID || item.id) === id
      );
      const price = product.salePrice || product.productPrice || product.price || 0;

      if (existingItem) {
        if (existingItem.quantity < MAX_QUANTITY) {
          existingItem.quantity += 1;
          state.totalAmount += price;
        }
      } else {
        state.items.push({
          ...product,
          productID: id,
          productName: product.name || product.productName,
          productPrice: price,
          frontImg: product.mainImage || product.frontImg || (product.images && product.images[0]),
          quantity: 1,
        });
        state.totalAmount += price;
      }
    },
    updateQuantity(state, action) {
      const { productID, quantity } = action.payload;
      const itemToUpdate = state.items.find(
        (item) => (item._id || item.productID || item.id) === productID
      );
      if (itemToUpdate) {
        const price = itemToUpdate.productPrice || itemToUpdate.price || 0;
        const difference = quantity - itemToUpdate.quantity;
        if (quantity <= MAX_QUANTITY && quantity >= 1) {
          itemToUpdate.quantity = quantity;
          state.totalAmount += difference * price;
        }
      }
    },
    removeFromCart(state, action) {
      const productId = action.payload;
      const itemToRemove = state.items.find(
        (item) => (item._id || item.productID || item.id) === productId
      );
      if (itemToRemove) {
        const price = itemToRemove.productPrice || itemToRemove.price || 0;
        state.totalAmount -= price * itemToRemove.quantity;
        state.items = state.items.filter(
          (item) => (item._id || item.productID || item.id) !== productId
        );
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
    setCartItemsRedux(state, action) {
      const items = action.payload || [];
      state.items = items;
      state.totalAmount = items.reduce((acc, item) => {
        const p = item.price || item.productPrice || item.salePrice || 0;
        return acc + p * (item.quantity || 1);
      }, 0);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.items = action.payload.items.map(i => ({
            ...i.product,
            productID: i.product._id,
            productName: i.product.name,
            productPrice: i.product.salePrice || i.product.price,
            frontImg: i.product.mainImage || (i.product.images && i.product.images[0]),
            quantity: i.quantity
          }));
          state.totalAmount = state.items.reduce((acc, curr) => acc + (curr.productPrice * curr.quantity), 0);
        }
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItemsRedux } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;

export default cartSlice.reducer;
