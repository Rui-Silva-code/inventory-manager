import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";

export async function logAudit({
  user,
  action,
  entity,
  entityId,
  beforeState,
  afterState
}) {

  try {
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
