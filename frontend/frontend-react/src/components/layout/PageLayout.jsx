export default function PageLayout({ title, actions, children }) {
  return (
    <div className="page">
      <div className="top-bar">
        <h1>{title}</h1>
        <div className="actions">{actions}</div>
      </div>
      {children}
    </div>
  );
}
