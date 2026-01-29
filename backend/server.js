import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products.js";
import auditLogsRouter from "./routes/auditLogs.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js"; // ✅ ADD THIS

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ============================
   ROUTES
============================ */
app.use("/auth", authRouter);       // ✅ THIS FIXES LOGIN
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
  console.log(`Server running on port ${PORT}`);
});
