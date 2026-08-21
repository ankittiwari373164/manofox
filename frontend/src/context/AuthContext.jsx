import { createContext, useContext, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("manofox_token");
    if (!token) {
      setUser(false);
      return;
    }
    api.get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("manofox_token");
        setUser(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("manofox_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: formatApiError(error) };
    }
  };

  const logout = () => {
    localStorage.removeItem("manofox_token");
    api.post("/auth/logout").catch(() => {});
    setUser(false);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
