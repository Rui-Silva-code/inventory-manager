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
    user.email,     // ✅ EMAIL SNAPSHOT
    user.role,
    action,
    entity,
    entityId,
    beforeState,
    afterState
  ]
);
