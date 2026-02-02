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
  const [selectedDate, setSelectedDate] = useState("");
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

  function sameDay(dateStr, filter) {
    if (!filter) return true;
    const d = new Date(dateStr);
    const f = new Date(filter);
    return (
      d.getFullYear() === f.getFullYear() &&
      d.getMonth() === f.getMonth() &&
      d.getDate() === f.getDate()
    );
  }

  const filteredLogs = useMemo(
    () => logs.filter(l => sameDay(l.created_at, selectedDate)),
    [logs, selectedDate]
  );

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const visibleLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  return (
    <Modal title="Audit Log" onClose={onClose}>
      {/* =========================
         DATE FILTER
         ========================= */}
      <div style={{ marginBottom: 16 }}>
        <label>
          Day
          <input
            type="date"
            className="audit-date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {/* =========================
         TABLE (NO WRAPPER SCROLL)
         ========================= */}
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
            const snapshot = log.after_state || log.before_state || {};

            return (
              <>
                <tr key={log.id}>
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
                  <tr>
                    <td colSpan={8}>
                      <table width="100%">
                        <thead>
                          <tr>
                            {FIELDS.map(f => (
                              <th key={f}>{f}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {FIELDS.map(f => (
                              <td key={f}>
                                {String(snapshot[f] ?? "")}
                              </td>
                            ))}
                          </tr>
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

      {/* =========================
         PAGINATION
         ========================= */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
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
