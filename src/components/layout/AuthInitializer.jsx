"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "@/store/features/authSlice";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        dispatch(setCredentials({ token, user: JSON.parse(user) }));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        dispatch(clearCredentials());
      }
    } else {
      dispatch(clearCredentials());
    }
  }, [dispatch]);

  return children;
}
