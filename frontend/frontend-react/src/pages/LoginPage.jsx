import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import "../styles/login.css";

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/products");
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Inventory Manager</h1>
        <Login />
      </div>
    </div>
  );
}
