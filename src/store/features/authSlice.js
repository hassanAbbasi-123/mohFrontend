// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  initialized: false, // 👈 new flag
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.initialized = true; // ✅ mark as ready
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.initialized = true; // ✅ still mark as ready
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
