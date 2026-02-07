import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      try {
        setUser(JSON.parse(u));
        setToken(t);
      } catch (_) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    setGlobalLoading(true);
    // Mimic initialization delay
    setTimeout(() => {
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(tokenValue);
        setGlobalLoading(false);
    }, 3500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        globalLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        setGlobalLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
