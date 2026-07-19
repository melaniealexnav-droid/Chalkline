import { Router } from "express";
import { table, filter } from "../db.js";

const router = Router();

// GET /api/subjects - list every portal (Math, Reading, Science, ...) with its topics
router.get("/", (req, res) => {
  const subjects = table("subjects").map((s) => ({
    ...s,
    topics: filter("topics", (t) => t.subjectId === s.id).sort((a, b) => a.order - b.order),
  }));
  res.json(subjects);
});

router.get("/:key", (req, res) => {
  const subject = table("subjects").find((s) => s.key === req.params.key);
  if (!subject) return res.status(404).json({ error: "No portal with that key." });
  const topics = filter("topics", (t) => t.subjectId === subject.id).sort((a, b) => a.order - b.order);
  res.json({ ...subject, topics });
});

export default router;
