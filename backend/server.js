import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import productsRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);


app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

app.use("/products", productsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
