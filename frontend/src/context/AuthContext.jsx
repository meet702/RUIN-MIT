import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success && response.data) {
      const { accessToken, refreshToken, user: userData } = response.data;
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userId", userData.id);
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.message || "Login failed" };
  };

  const register = async (fullName, email, password) => {
    const response = await authService.register(fullName, email, password);
    return response; // Usually returns success without tokens, requires OTP
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
