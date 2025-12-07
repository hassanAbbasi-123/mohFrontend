// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./features/authApi";
import { categoryApi } from "./features/categoryApi";
import { productApi } from "./features/productApi";
import { orderApi } from "./features/orderApi";
import { wishlistApi } from "./features/wishlistApi";
import { cartApi } from "./features/cartApi";
import { couponApi } from "./features/couponApi";
import { analyticsApi } from "./features/analyticsApi";
import { chatApi } from "./features/chatApi";
import authReducer from "./features/authSlice";
import { inventoryApi } from "./features/inventoryApi";
import { profileApi } from "./features/profileApi";
import { userManagementApi } from "./features/userManagementApi";
import { sellerManagementApi } from "./features/sellerManagementApi";
import { bannerApi } from "./features/bannerApi";
import { leadsApi } from "./features/leadsApi";
import { accountsApi } from "./features/accountsApi";  

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [userManagementApi.reducerPath]: userManagementApi.reducer,
    [sellerManagementApi.reducerPath]: sellerManagementApi.reducer,
    [bannerApi.reducerPath]: bannerApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat([
        authApi.middleware,
        categoryApi.middleware,
        productApi.middleware,
        orderApi.middleware,
        wishlistApi.middleware,
        cartApi.middleware,
        couponApi.middleware,
        analyticsApi.middleware,
        chatApi.middleware,
        inventoryApi.middleware,
        profileApi.middleware,
        userManagementApi.middleware,
        sellerManagementApi.middleware,
        bannerApi.middleware,
        leadsApi.middleware,
        accountsApi.middleware,
      ]),
});