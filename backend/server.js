import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products.js";
import auditLogsRouter from "./routes/auditLogs.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

import pool from "./db.js";

dotenv.config();

const app = express();

/* ============================
   MIDDLEWARE (FIXED)
============================ */
app.use(cors());

// 🔴 THIS IS THE FIX
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ============================
   ROUTES
============================ */
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/audit-logs", auditLogsRouter);
app.use("/users", usersRouter);

/* ============================
   HEALTH CHECK
============================ */
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ============================
   DB CHECK
============================ */
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection OK");
  } catch (err) {
    console.error("❌ Database connection FAILED");
    console.error(err.message);
    process.exit(1);
  }
})();
