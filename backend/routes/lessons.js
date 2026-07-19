import { Router } from "express";
import { filter, insert } from "../db.js";
import { requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  const { subjectId, topicId } = req.query;
  const lessons = filter("lessons", (l) => {
    if (subjectId && l.subjectId !== subjectId) return false;
    if (topicId && l.topicId !== topicId) return false;
    return true;
  }).sort((a, b) => a.order - b.order);
  res.json(lessons);
});

router.post("/", requireTeacher, (req, res) => {
  const { subjectId, topicId, title, body, order } = req.body;
  if (!subjectId || !title || !body) {
    return res.status(400).json({ error: "A lesson needs a subject, title, and body." });
  }
  const lesson = insert("lessons", { subjectId, topicId: topicId || null, title, body, order: order || 99 });
  res.status(201).json(lesson);
});

export default router;
