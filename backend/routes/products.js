import express from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { logAudit } from "../utils/auditLogger.js";
import { parse } from "csv-parse/sync";

const router = express.Router();

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Safely convert CSV values to INTEGER for PostgreSQL
 * - returns null for empty, invalid, NaN, undefined
 */
function toInt(value) {
  if (value === undefined || value === null) return null;

  const v = String(value).trim();
  if (v === "") return null;

  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

/* =========================================================
   GET PRODUCTS
   ========================================================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* =========================================================
   CREATE SINGLE PRODUCT
   ========================================================= */
router.post(
  "/",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    const {
      referencia,
      cor,
      x,
      y,
      rack,
      acab,
      obs,
      marked = false
    } = req.body;

    try {
      const result = await pool.query(
        `
        INSERT INTO products (
          id, referencia, cor, x, y, rack, acab, obs, marked
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          uuidv4(),
          referencia ?? null,
          cor ?? null,
          toInt(x),
          toInt(y),
          rack ?? null,
          acab ?? null,
          obs ?? null,
          marked
        ]
      );

      const createdProduct = result.rows[0];

      await logAudit({
        user: req.user,
        action: "CREATE",
        entity: "product",
        entityId: createdProduct.id,
        beforeState: null,
        afterState: createdProduct
      });

      res.status(201).json(createdProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

/* =========================================================
   CSV IMPORT (FINAL – SAFE, ROBUST)
   ========================================================= */
router.post(
  "/import",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    try {
      const { csv } = req.body;

      if (!csv) {
        return res.status(400).json({ error: "CSV data missing" });
      }

      const records = parse(csv, {
        columns: headers =>
          headers.map(h =>
            h.replace(/^\ufeff/, "").trim().toLowerCase()
          ),
        delimiter: ";",
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
      });

      let inserted = 0;

      for (const row of records) {
        const product = {
          id: uuidv4(),
          referencia: row.referencia || null,
          cor: row.cor || null,
          x: toInt(row.x),
          y: toInt(row.y),
          rack: row.rack || null,
          acab: row.acab || null,
          obs: row.obs || null,
          marked: false
        };

        const result = await pool.query(
          `
          INSERT INTO products (
            id, referencia, cor, x, y, rack, acab, obs, marked
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *
          `,
          [
            product.id,
            product.referencia,
            product.cor,
            product.x,
            product.y,
            product.rack,
            product.acab,
            product.obs,
            product.marked
          ]
        );

        await logAudit({
          user: req.user,
          action: "CREATE",
          entity: "product",
          entityId: product.id,
          beforeState: null,
          afterState: result.rows[0]
        });

        inserted++;
      }

      res.json({
        message: "CSV imported successfully",
        rows: inserted
      });
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      res.status(500).json({ error: "Failed to import CSV" });
    }
  }
);

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */
router.put(
  "/:id",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    const { id } = req.params;
    const {
      referencia,
      cor,
      x,
      y,
      rack,
      acab,
      obs,
      marked
    } = req.body;

    try {
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const beforeProduct = existing.rows[0];

      const result = await pool.query(
        `
        UPDATE products
        SET
          referencia = $1,
          cor = $2,
          x = $3,
          y = $4,
          rack = $5,
          acab = $6,
          obs = $7,
          marked = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
        `,
        [
          referencia ?? null,
          cor ?? null,
          toInt(x),
          toInt(y),
          rack ?? null,
          acab ?? null,
          obs ?? null,
          marked,
          id
        ]
      );

      const updatedProduct = result.rows[0];

      await logAudit({
        user: req.user,
        action: "UPDATE",
        entity: "product",
        entityId: id,
        beforeState: beforeProduct,
        afterState: updatedProduct
      });

      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

/* =========================================================
   DELETE PRODUCT
   ========================================================= */
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const beforeProduct = existing.rows[0];

      await pool.query(
        "DELETE FROM products WHERE id = $1",
        [id]
      );

      await logAudit({
        user: req.user,
        action: "DELETE",
        entity: "product",
        entityId: id,
        beforeState: beforeProduct,
        afterState: null
      });

      res.json({ message: "Product deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

export default router;
