import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AdminSession {
  email: string;
  name: string;
  role: "admin";
}

interface AdminAuthContextValue {
  admin: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const ADMIN_CREDENTIALS = {
  email: "quickeatsfoodadmin@gmail.com",
  password: "quickeatsfoodadmin",
  name: "QuickEats Admin",
} as const;

const STORAGE_KEY = "quickeats_admin_session_v1";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem('adminToken');

    // If we have a session but no token (legacy/mock session), force logout
    if (stored && !token) {
      console.warn("[AdminAuth] Legacy session detected without token. Forcing logout.");
      localStorage.removeItem(STORAGE_KEY);
      setAdmin(null);
    } else if (stored) {
      console.log("[AdminAuth] Restoring session. Token found:", !!token);
      try {
        const parsed = JSON.parse(stored) as AdminSession;
        setAdmin(parsed);
      } catch (err) {
        console.error("Failed to parse admin session", err);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('adminToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = 5000; // Backend port
      const apiUrl = `${protocol}//${hostname}:${port}/api/auth/login`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" };
      }

      // Check if user is actually an admin
      // Decode token or check response role if available. 
      // For now, we trust the backend login, but we should verify role.
      // The backend login returns { token }. We can fetch user profile to check role or trust it works.

      // Store token for API calls
      localStorage.setItem('adminToken', data.token);

      const session: AdminSession = {
        email: email,
        name: "Admin", // We could fetch profile to get actual name
        role: "admin",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setAdmin(session);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error during login" };
    }
  }, []);


  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('adminToken');
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin,
      isLoading,
      token: localStorage.getItem('adminToken'),
      login,
      logout,
    }),
    [admin, isLoading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};
