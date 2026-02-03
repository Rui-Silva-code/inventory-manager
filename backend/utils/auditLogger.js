import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";

/* =========================================================
   AUDIT LOGGER (SAFE)
   ========================================================= */

function hasChanges(before, after) {
  if (!before || !after) return true;

  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after)
  ]);

  for (const key of keys) {
    if (String(before[key] ?? "") !== String(after[key] ?? "")) {
      return true;
    }
  }

  return false;
}

export async function logAudit({
  user,
  action,
  entity,
  entityId,
  beforeState,
  afterState
}) {
  try {
    /* =========================
       SKIP NO-OP UPDATES
       ========================= */
    if (action === "UPDATE") {
      if (!hasChanges(beforeState, afterState)) {
        return; // 🚫 nothing changed → no audit log
      }
    }

    await pool.query(
      `
      INSERT INTO audit_logs (
        id,
        user_id,
        user_email,
        user_role,
        action,
        entity,
        entity_id,
        before_state,
        after_state
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        uuidv4(),
        user.id,
        user.email ?? null,
        user.role,
        action,
        entity,
        entityId,
        beforeState,
        afterState
      ]
    );
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err);
  }
}
