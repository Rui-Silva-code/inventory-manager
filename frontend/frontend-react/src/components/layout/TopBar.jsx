export default function TopBar({ user, onLogout }) {
  return (
    <div className="top-bar">

      <div className="top-right">
        <div className="user-actions">
          {/* ROLE BADGE */}
          <span className={`role-badge role-${user.role}`}>
            {user.role}
          </span>

          {/* USER EMAIL */}
          <span className="user-email">
            {user.email}
          </span>

          {/* LOGOUT */}
          <button onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
