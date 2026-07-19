import { Router } from "express";
import { find, filter, table } from "../db.js";

const router = Router();

router.get("/:id", (req, res) => {
  const student = find("students", (s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found." });

  const attempts = filter("attempts", (a) => a.studentId === student.id);
  const diagnostics = filter("diagnostics", (d) => d.studentId === student.id);

  const bySubject = {};
  for (const s of table("subjects")) {
    const subjectAttempts = attempts.filter((a) => a.subjectId === s.id);
    const correct = subjectAttempts.filter((a) => a.correct).length;
    const latestDiagnostic = diagnostics.filter((d) => d.subjectId === s.id).slice(-1)[0] || null;
    bySubject[s.key] = {
      attempts: subjectAttempts.length,
      correct,
      accuracy: subjectAttempts.length ? Math.round((correct / subjectAttempts.length) * 100) : null,
      placementLevel: latestDiagnostic ? latestDiagnostic.placementLevel : null,
    };
  }

  res.json({ ...student, progress: bySubject });
});

export default router;
