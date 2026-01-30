import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";

/*
  AuthContext stores:
  - logged user
  - JWT token
  - helper booleans for roles
*/
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
    On app load:
    - Check if token exists
    - Decode user info from token
  */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch {
        // Invalid token → cleanup
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  /*
    Login:
    - Call backend
    - Store token
    - Decode user
  */
  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    const decoded = jwtDecode(res.data.token);
    setUser(decoded);
  }

  /*
    Logout:
    - Remove token
    - Reset user
  */
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // 🔐 Role helpers (VERY IMPORTANT)
  const isViewer = user?.role === "viewer";
  const isEditor = user?.role === "editor";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isViewer,
        isEditor,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook shortcut
export function useAuth() {
  return useContext(AuthContext);
}
