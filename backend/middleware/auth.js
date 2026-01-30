import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔴 THIS IS THE IMPORTANT LINE
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
