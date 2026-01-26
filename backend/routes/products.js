import express from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";


router.get("/", requireAuth, async (req, res) => {
  // existing logic
});

router.post(
  "/",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    // existing logic
  }
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "editor"),
  async (req, res) => {
    // existing logic
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    // existing logic
  }
);



const router = express.Router();

/**
 * GET /products
 * Returns all products
 */
router.get("/", async (req, res) => {
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

/**
 * POST /products
 * Creates a new product
 */
router.post("/", async (req, res) => {
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
        referencia,
        cor,
        x,
        y,
        rack,
        acab,
        obs,
        marked
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * PUT /products/:id
 * Updates an existing product
 */
router.put("/:id", async (req, res) => {
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
        referencia,
        cor,
        x,
        y,
        rack,
        acab,
        obs,
        marked,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE /products/:id
 * Deletes a product (with confirmation handled on frontend)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
