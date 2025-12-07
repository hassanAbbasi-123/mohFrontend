// src/hooks/useAuth.js
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const auth = useSelector((state) => state.auth); // Adjust based on your store structure
  return {
    isAuthenticated: !!auth.user, // Assuming auth.user exists when logged in
    user: auth.user || null,
  };
};