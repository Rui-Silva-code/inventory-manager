import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../api/auditLogs";
import Modal from "../common/Modal";

const PAGE_SIZE = 10;

const FIELDS = [
  "referencia",
  "cor",
  "x",
  "y",
  "rack",
  "acab",
  "obs",
  "marked"
];

export default function AuditLogPanel({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(new Set());

  const [calendarDate, setCalendarDate] = useState("");
  const [typedDate, setTypedDate] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const data = await getAuditLogs();
    setLogs(data);
  }

  function toggle(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* =========================================================
     SMART DATE MATCHING (PROGRESSIVE)
     ========================================================= */
  function matchesTypedDate(dateStr) {
    if (!typedDate) return true;

    const parts = typedDate.split("-").filter(Boolean);
    if (!parts.length) return true;

    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    if (parts.length === 1) {
      return day === Number(parts[0]);
    }

    if (parts.length === 2) {
      return (
        day === Number(parts[0]) &&
        month === Number(parts[1])
      );
    }

    if (parts.length >= 3) {
      return (
        day === Number(parts[0]) &&
        month === Number(parts[1]) &&
        year === Number(parts[2])
      );
    }

    return true;
  }

  function matchesCalendarDate(dateStr) {
    if (!calendarDate) return true;

    const d = new Date(dateStr);
    const f = new Date(calendarDate);

    return (
      d.getFullYear() === f.getFullYear() &&
      d.getMonth() === f.getMonth() &&
      d.getDate() === f.getDate()
    );
  }

  const filteredLogs = useMemo(() => {
    setPage(1);

    return logs.filter(log =>
      matchesCalendarDate(log.created_at) &&
      matchesTypedDate(log.created_at)
    );
  }, [logs, calendarDate, typedDate]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const visibleLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  function rowClass(action) {
    if (action === "CREATE") return "audit-row-create";
    if (action === "UPDATE") return "audit-row-update";
    if (action === "DELETE") return "audit-row-delete";
    return "";
  }

  function isChanged(field, before, after) {
    return String(before ?? "") !== String(after ?? "");
  }

  return (
    <Modal title="Audit Log" onClose={onClose}>
      {/* =========================
         FILTERS
         ========================= */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <label>
          Calendar
          <input
            type="date"
            value={calendarDate}
            onChange={e => {
              setCalendarDate(e.target.value);
              setTypedDate("");
            }}
          />
        </label>

        <label>
          Date (DD-MM-YYYY)
          <input
            type="text"
            placeholder="DD-MM-YYYY"
            value={typedDate}
            onChange={e => {
              setTypedDate(e.target.value);
              setCalendarDate("");
            }}
          />
        </label>
      </div>

      {/* =========================
         TABLE
         ========================= */}
      <div className="audit-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Ref</th>
              <th>X</th>
              <th>Y</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {visibleLogs.map(log => {
              const isOpen = expanded.has(log.id);
              const before = log.before_state || {};
              const after = log.after_state || {};
              const snapshot = log.after_state || log.before_state || {};

              return (
                <>
                  <tr
                    key={log.id}
                    className={rowClass(log.action)}
                  >
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.user_email}</td>
                    <td>{log.user_role}</td>
                    <td>{log.action}</td>
                    <td>{snapshot.referencia}</td>
                    <td>{snapshot.x}</td>
                    <td>{snapshot.y}</td>
                    <td>
                      <button onClick={() => toggle(log.id)}>
                        {isOpen ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className={rowClass(log.action)}>
                      <td colSpan={8}>
                        <table width="100%">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Before</th>
                              <th>After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {FIELDS.map(field => {
                              const changed = isChanged(
                                field,
                                before[field],
                                after[field]
                              );

                              return (
                                <tr key={field}>
                                  <td>{field}</td>
                                  <td>{String(before[field] ?? "")}</td>
                                  <td
                                    className={
                                      changed && log.action === "UPDATE"
                                        ? "audit-changed"
                                        : ""
                                    }
                                  >
                                    {String(after[field] ?? "")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================
         PAGINATION
         ========================= */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </Modal>
  );
}
