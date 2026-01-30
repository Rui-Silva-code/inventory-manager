import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../api/auditLogs";


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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function rowColor(action) {
    if (action === "CREATE") return "#41ff77";
    if (action === "UPDATE") return "#fce264";
    if (action === "DELETE") return "#ff4343";
    return "white";
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

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => sameDay(l.created_at, selectedDate));
  }, [logs, selectedDate]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const visibleLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  function valueChanged(field, before, after) {
    return before?.[field] !== after?.[field];
  }

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>
        Audit Log{" "}
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Close
        </button>
      </h3>

      {/* ===== CALENDAR FILTER ===== */}
      <div style={{ marginBottom: 10 }}>
        <label>
          Day:{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {/* ===== TABLE ===== */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Ref</th>
            <th>X</th>
            <th>Y</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {visibleLogs.map((log) => {
            const after = log.after_state;
            const before = log.before_state;
            const snapshot = after || before || {};
            const isOpen = expanded.has(log.id);

            return (
              <>
                {/* ===== SUMMARY ROW ===== */}
                <tr
                  key={log.id}
                  style={{ backgroundColor: rowColor(log.action) }}
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

                {/* ===== DETAILS ===== */}
                {isOpen && (
                  <tr
                    key={`${log.id}-details`}
                    style={{ backgroundColor: rowColor(log.action) }}
                  >
                    <td colSpan={8}>
                      {/* ===== UPDATE: BEFORE / AFTER ===== */}
                      {log.action === "UPDATE" && (
                        <>
                          <b>BEFORE</b>
                          <table border="1" width="100%" style={{ marginBottom: 10 }}>
                            <thead>
                              <tr>
                                {FIELDS.map((f) => (
                                  <th key={f}>{f}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {FIELDS.map((f) => (
                                  <td key={f}>{String(before?.[f] ?? "")}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>

                          <b>AFTER</b>
                          <table border="1" width="100%">
                            <thead>
                              <tr>
                                {FIELDS.map((f) => (
                                  <th key={f}>{f}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {FIELDS.map((f) => (
                                  <td
                                    key={f}
                                    style={{
                                      backgroundColor: valueChanged(
                                        f,
                                        before,
                                        after
                                      )
                                        ? "#f873e2"
                                        : "transparent"
                                    }}
                                  >
                                    {String(after?.[f] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </>
                      )}

                      {/* ===== CREATE ===== */}
                      {log.action === "CREATE" && (
                        <>
                          <b>Created product</b>
                          <table border="1" width="100%">
                            <thead>
                              <tr>
                                {FIELDS.map((f) => (
                                  <th key={f}>{f}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {FIELDS.map((f) => (
                                  <td key={f}>
                                    {String(after?.[f] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </>
                      )}

                      {/* ===== DELETE ===== */}
                      {log.action === "DELETE" && (
                        <>
                          <b>Deleted product</b>
                          <table border="1" width="100%">
                            <thead>
                              <tr>
                                {FIELDS.map((f) => (
                                  <th key={f}>{f}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {FIELDS.map((f) => (
                                  <td key={f}>
                                    {String(before?.[f] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      <div style={{ marginTop: 10 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
