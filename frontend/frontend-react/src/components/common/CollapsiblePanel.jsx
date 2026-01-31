import { useState } from "react";

export default function CollapsiblePanel({
  title,
  defaultOpen = false,
  children
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel">
      <div
        className="panel-header"
        onClick={() => setOpen((o) => !o)}
      >
        <strong>{title}</strong>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && <div className="panel-body">{children}</div>}
    </div>
  );
}
