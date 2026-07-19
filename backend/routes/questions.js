import { Router } from "express";
import { insert, filter } from "../db.js";
import { requireTeacher } from "../middleware/auth.js";

const router = Router();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/questions/next?subjectId=&topicId=&difficulty=3&exclude=id1,id2
// Core adaptive-practice engine: returns the question whose difficulty is
// closest to the student's current level, preferring ones they haven't
// seen recently. This "staircase" approach is the same idea iReady and
// similar tools use — it's a simpler cousin of full Item Response Theory,
// good enough for classroom practice without needing a stats pipeline.
router.get("/next", (req, res) => {
  const { subjectId, topicId, difficulty } = req.query;
  const exclude = (req.query.exclude || "").split(",").filter(Boolean);
  const target = Math.min(5, Math.max(1, Number(difficulty) || 3));

  let pool = filter("questions", (q) => {
    if (subjectId && q.subjectId !== subjectId) return false;
    if (topicId && q.topicId !== topicId) return false;
    return true;
  });
  if (pool.length === 0) return res.status(404).json({ error: "No questions found for that portal yet." });

  let unseen = pool.filter((q) => !exclude.includes(q.id));
  if (unseen.length === 0) unseen = pool; // ran out of fresh ones, allow repeats

  unseen = shuffle(unseen).sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target));
  const chosen = unseen[0];
  const { answerIndex, explanation, ...safeQuestion } = chosen; // never send the answer or its giveaway explanation up front
  res.json(safeQuestion);
});

// GET /api/questions/diagnostic?subjectId=
// Returns a fixed spread of difficulty 1-5 questions used for the
// one-time placement test.
router.get("/diagnostic", (req, res) => {
  const { subjectId, topicId } = req.query;
  if (!subjectId) return res.status(400).json({ error: "subjectId is required." });
  const pool = filter("questions", (q) => q.subjectId === subjectId && (!topicId || q.topicId === topicId));
  const byDifficulty = [1, 2, 3, 4, 5].flatMap((d) => shuffle(pool.filter((q) => q.difficulty === d)).slice(0, 2));
  const set = shuffle(byDifficulty).map(({ answerIndex, explanation, ...q }) => q);
  res.json(set);
});

// POST /api/questions - teachers can add their own content, free forever.
router.post("/", requireTeacher, (req, res) => {
  const { subjectId, topicId, difficulty, prompt, choices, answerIndex, explanation } = req.body;
  if (!subjectId || !prompt || !Array.isArray(choices) || choices.length < 2 || answerIndex == null) {
    return res.status(400).json({ error: "A question needs a subject, prompt, at least 2 choices, and the correct answer index." });
  }
  const q = insert("questions", {
    subjectId,
    topicId: topicId || null,
    difficulty: Math.min(5, Math.max(1, Number(difficulty) || 3)),
    prompt,
    choices,
    answerIndex: Number(answerIndex),
    explanation: explanation || "",
    createdBy: req.teacher.id,
  });
  res.status(201).json(q);
});

// POST /api/questions/:id/check - grade an answer without ever exposing
// the answer key to the client ahead of time.
router.post("/:id/check", (req, res) => {
  const { answerIndex } = req.body;
  const q = filter("questions", (x) => x.id === req.params.id)[0];
  if (!q) return res.status(404).json({ error: "Question not found." });
  const correct = Number(answerIndex) === q.answerIndex;
  res.json({ correct, answerIndex: q.answerIndex, explanation: q.explanation });
});

export default router;
