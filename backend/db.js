import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",          // 👈 IMPORTANT
  password: "databasetest",
  database: "inventory_manager",
});

export default pool;
