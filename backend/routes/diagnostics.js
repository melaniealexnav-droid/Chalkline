import { Router } from "express";
import { insert, filter } from "../db.js";

const router = Router();

// POST /api/diagnostics
// body: { studentId, subjectId, responses: [{ questionId, selectedIndex }] }
// Placement logic: score correctness weighted by each question's difficulty,
// then map the weighted score onto a 1-5 placement level. This mirrors how
// adaptive diagnostics place a student "on level," "below level," etc.,
// without needing a full psychometric model.
router.post("/", (req, res) => {
  const { studentId, subjectId, responses } = req.body;
  if (!studentId || !subjectId || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: "studentId, subjectId, and responses are required." });
  }

  const questionIds = responses.map((r) => r.questionId);
  const questions = filter("questions", (q) => questionIds.includes(q.id));
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));

  let earned = 0;
  let possible = 0;
  let correctCount = 0;
  for (const r of responses) {
    const q = byId[r.questionId];
    if (!q) continue;
    possible += q.difficulty;
    if (Number(r.selectedIndex) === q.answerIndex) {
      earned += q.difficulty;
      correctCount += 1;
    }
  }

  const ratio = possible ? earned / possible : 0;
  // Map 0-1 weighted score onto a 1-5 placement level.
  const placementLevel = Math.max(1, Math.min(5, Math.round(ratio * 4) + 1));

  const result = insert("diagnostics", {
    studentId,
    subjectId,
    score: correctCount,
    total: responses.length,
    ratio: Math.round(ratio * 100),
    placementLevel,
  });

  res.status(201).json(result);
});

router.get("/student/:id", (req, res) => {
  res.json(filter("diagnostics", (d) => d.studentId === req.params.id));
});

export default router;
