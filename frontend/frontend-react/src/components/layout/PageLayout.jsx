export default function PageLayout({ title, actions, children }) {
  return (
    <div className="page">
      <div className="top-bar">
        <div className="top-left">
          <img
            src="/logo/examplelogo.png"
            alt="Company logo"
            className="company-logo"
          />
          <h1>{title}</h1>
        </div>

        <div className="actions">{actions}</div>
      </div>

      {children}
    </div>
  );
}
