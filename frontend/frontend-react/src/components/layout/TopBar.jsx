export default function TopBar({ user, onLogout }) {
  return (
    <div className="actions">
      <span>{user.email}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
