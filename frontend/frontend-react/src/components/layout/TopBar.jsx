export default function TopBar({
  user,
  onLogout,
  onAuditLog,
  onCreateUser,
  onUsers,
  isAdmin
}) {
  return (
    <div className="actions">
      <span>{user.email}</span>

      {isAdmin && (
        <>
          <button onClick={onAuditLog}>Audit Logs</button>
          <button onClick={onCreateUser}>Create User</button>
          <button onClick={onUsers}>Users</button>
        </>
      )}

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
