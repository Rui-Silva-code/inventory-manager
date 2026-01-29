import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import auditLogsRoutes from "./routes/auditLogs.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 ROUTES
app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/audit-logs", auditLogsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
