import { Router } from "express";
import { insert, find, hashPassword, verifyPassword } from "../db.js";

const router = Router();

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (find("teachers", (t) => t.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }
  const teacher = insert("teachers", { name, email, passwordHash: hashPassword(password) });
  res.status(201).json({ id: teacher.id, name: teacher.name, email: teacher.email });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const teacher = find("teachers", (t) => t.email.toLowerCase() === (email || "").toLowerCase());
  if (!teacher || !verifyPassword(password || "", teacher.passwordHash)) {
    return res.status(401).json({ error: "That email and password don't match our records." });
  }
  res.json({ id: teacher.id, name: teacher.name, email: teacher.email });
});

export default router;
