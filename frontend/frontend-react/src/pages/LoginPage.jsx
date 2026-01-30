import "../styles/login.css";
import Login from "../components/Login";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Inventory Manager</h1>
        <Login />
      </div>
    </div>
  );
}
