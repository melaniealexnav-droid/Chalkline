import express from "express";
import cors from "cors";

import subjectsRouter from "./routes/subjects.js";
import teachersRouter from "./routes/teachers.js";
import classesRouter from "./routes/classes.js";
import questionsRouter from "./routes/questions.js";
import attemptsRouter from "./routes/attempts.js";
import diagnosticsRouter from "./routes/diagnostics.js";
import lessonsRouter from "./routes/lessons.js";
import studentsRouter from "./routes/students.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, name: "underfunded-schools-backend" }));

app.use("/api/subjects", subjectsRouter);
app.use("/api/teachers", teachersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/diagnostics", diagnosticsRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/students", studentsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Learning platform API running on http://localhost:${PORT}`);
});
