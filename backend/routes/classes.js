import { Router } from "express";
import { insert, filter, find, joinCode, table } from "../db.js";
import { requireTeacher } from "../middleware/auth.js";

const router = Router();

// Teacher creates a class -> gets a join code to write on the board
router.post("/", requireTeacher, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Give the class a name first." });
  const cls = insert("classes", { teacherId: req.teacher.id, name, joinCode: joinCode() });
  res.status(201).json(cls);
});

// Teacher's own classes
router.get("/mine", requireTeacher, (req, res) => {
  const classes = filter("classes", (c) => c.teacherId === req.teacher.id);
  res.json(classes);
});

// Roster + per-subject progress for one class (teacher dashboard)
router.get("/:id", requireTeacher, (req, res) => {
  const cls = find("classes", (c) => c.id === req.params.id && c.teacherId === req.teacher.id);
  if (!cls) return res.status(404).json({ error: "Class not found." });

  const students = filter("students", (s) => s.classId === cls.id).map((student) => {
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
    return { ...student, progress: bySubject };
  });

  res.json({ ...cls, students });
});

// Student joins with the class code + their name. No password needed.
router.post("/join", (req, res) => {
  const { code, name, avatar } = req.body;
  if (!code || !name) return res.status(400).json({ error: "Enter the class code and your name." });
  const cls = find("classes", (c) => c.joinCode === code.toUpperCase().trim());
  if (!cls) return res.status(404).json({ error: "That class code doesn't match any class. Double-check with your teacher." });
  const student = insert("students", {
    classId: cls.id,
    name: name.trim(),
    avatar: avatar || "🦉",
    points: 0,
    level: 1,
    streak: 0,
  });
  res.status(201).json({ student, className: cls.name });
});

export default router;
