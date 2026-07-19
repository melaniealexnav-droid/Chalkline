import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import ChalkTrail from "../components/ChalkTrail.jsx";
import LevelUpToast from "../components/LevelUpToast.jsx";

export default function AdaptivePractice() {
  const { subjectKey } = useParams();
  const [subject, setSubject] = useState(null);
  const [question, setQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState("");
  const [levelUp, setLevelUp] = useState(null);
  const seen = useRef([]);
  const { student, updateStudentStats } = useSession();

  useEffect(() => {
    api.getSubject(subjectKey).then((s) => {
      setSubject(s);
      const placement = student?.progress?.[subjectKey]?.placementLevel;
      const startDifficulty = placement || 3;
      setDifficulty(startDifficulty);
      loadQuestion(s.id, startDifficulty);
    }).catch((e) => setError(e.message));
  }, [subjectKey]);

  async function loadQuestion(subjectId, targetDifficulty) {
    try {
      const q = await api.nextQuestion({ subjectId, difficulty: targetDifficulty, exclude: seen.current.join(",") });
      seen.current = [...seen.current, q.id].slice(-12);
      setQuestion(q);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSubmit(selectedIndex) {
    const res = await api.submitAttempt({
      studentId: student.id,
      questionId: question.id,
      selectedIndex,
      difficultyAtAttempt: question.difficulty,
    });
    setAnswered((n) => n + 1);
    if (res.correct) setCorrectCount((n) => n + 1);
    updateStudentStats({ points: res.totalPoints, level: res.level, streak: res.streak });
    if (res.leveledUp) setLevelUp(res.level);
    setDifficulty(res.nextDifficulty);
    return res;
  }

  function handleNext() {
    loadQuestion(subject.id, difficulty);
  }

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject || !question || !student) return <div className="container" style={{ paddingTop: 40 }}><p>Loading practice…</p></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 620, margin: "0 auto" }}>
      {levelUp && <LevelUpToast level={levelUp} onDone={() => setLevelUp(null)} />}
      <Link to={`/portal/${subjectKey}`} style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-soft)" }}>← Exit practice</Link>
      <p className="eyebrow" style={{ marginTop: 18 }}>{subject.name} · Adaptive Practice</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 26px" }}>
        <ChalkTrail progress={Math.min(1, answered / 15)} color={subject.color} label={`${answered} answered`} />
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 13.5, marginBottom: 18, color: "var(--ink-soft)" }}>
        <span>🔥 Streak: {student.streak ?? 0}</span>
        <span>✅ {correctCount}/{answered} correct</span>
        <span>⭐ {student.points} pts · Level {student.level}</span>
      </div>

      <QuestionCard
        question={question}
        onSubmit={handleSubmit}
        onNext={handleNext}
        accentColor={subject.color}
        footerExtra="Right answers bump the difficulty up; misses ease it back down."
      />
    </div>
  );
}
