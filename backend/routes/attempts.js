import { Router } from "express";
import { insert, find, update, filter } from "../db.js";

const router = Router();

function levelForPoints(points) {
  return Math.floor(points / 100) + 1;
}

// POST /api/attempts
// body: { studentId, questionId, selectedIndex, difficultyAtAttempt }
router.post("/", (req, res) => {
  const { studentId, questionId, selectedIndex, difficultyAtAttempt } = req.body;
  const student = find("students", (s) => s.id === studentId);
  const question = find("questions", (q) => q.id === questionId);
  if (!student) return res.status(404).json({ error: "Student not found." });
  if (!question) return res.status(404).json({ error: "Question not found." });

  const correct = Number(selectedIndex) === question.answerIndex;
  const difficulty = difficultyAtAttempt || question.difficulty;

  insert("attempts", {
    studentId,
    questionId,
    subjectId: question.subjectId,
    topicId: question.topicId,
    correct,
    difficulty,
  });

  // Points: harder correct answers are worth more, rewarding growth not just volume.
  const pointsEarned = correct ? difficulty * 10 : 2; // small effort credit even when wrong
  const newPoints = student.points + pointsEarned;
  const newStreak = correct ? student.streak + 1 : 0;
  const newLevel = levelForPoints(newPoints);
  const leveledUp = newLevel > student.level;

  update("students", student.id, { points: newPoints, level: newLevel, streak: newStreak });

  // Staircase adaptive difficulty: nudge up on correct, down on incorrect.
  const nextDifficulty = Math.min(5, Math.max(1, difficulty + (correct ? 1 : -1)));

  res.json({
    correct,
    explanation: question.explanation,
    answerIndex: question.answerIndex,
    pointsEarned,
    totalPoints: newPoints,
    level: newLevel,
    leveledUp,
    streak: newStreak,
    nextDifficulty,
  });
});

// GET /api/attempts/student/:id - recent history, useful for a student's own progress view
router.get("/student/:id", (req, res) => {
  const attempts = filter("attempts", (a) => a.studentId === req.params.id)
    .slice(-50)
    .reverse();
  res.json(attempts);
});

export default router;
