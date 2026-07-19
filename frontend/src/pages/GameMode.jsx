import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import LevelUpToast from "../components/LevelUpToast.jsx";

const TIME_LIMIT = 20;
const LETTERS = ["A", "B", "C", "D", "E"];

export default function GameMode() {
  const { subjectKey } = useParams();
  const [subject, setSubject] = useState(null);
  const [question, setQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [combo, setCombo] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [levelUp, setLevelUp] = useState(null);
  const [error, setError] = useState("");
  const seen = useRef([]);
  const timerRef = useRef(null);
  const { student, updateStudentStats } = useSession();

  useEffect(() => {
    api.getSubject(subjectKey).then((s) => {
      setSubject(s);
      loadQuestion(s.id, 3);
    }).catch((e) => setError(e.message));
    return () => clearInterval(timerRef.current);
  }, [subjectKey]);

  useEffect(() => {
    if (!question || result) return;
    clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question]);

  async function loadQuestion(subjectId, targetDifficulty) {
    setSelected(null);
    setResult(null);
    try {
      const q = await api.nextQuestion({ subjectId, difficulty: targetDifficulty, exclude: seen.current.join(",") });
      seen.current = [...seen.current, q.id].slice(-12);
      setQuestion(q);
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitAnswer(index) {
    clearInterval(timerRef.current);
    setSelected(index);
    const res = await api.submitAttempt({
      studentId: student.id,
      questionId: question.id,
      selectedIndex: index,
      difficultyAtAttempt: question.difficulty,
    });
    const speedBonus = res.correct ? Math.round((timeLeft / TIME_LIMIT) * 15) : 0;
    setRoundPoints(res.pointsEarned + speedBonus);
    setCombo(res.correct ? combo + 1 : 0);
    updateStudentStats({ points: res.totalPoints + speedBonus, level: res.level, streak: res.streak });
    if (res.leveledUp) setLevelUp(res.level);
    setDifficulty(res.nextDifficulty);
    setResult(res);
  }

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject || !question || !student) return <div className="container" style={{ paddingTop: 40 }}><p>Loading game mode…</p></div>;

  const pct = (timeLeft / TIME_LIMIT) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--chalkboard)", color: "var(--paper)" }}>
      {levelUp && <LevelUpToast level={levelUp} onDone={() => setLevelUp(null)} />}
      <div className="container" style={{ paddingTop: 30, paddingBottom: 80, maxWidth: 640, margin: "0 auto" }}>
        <Link to={`/portal/${subjectKey}`} style={{ fontSize: 13, textDecoration: "none", color: "rgba(251,248,242,0.7)" }}>
          ← Exit game mode
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0" }}>
          <span className="chalk-label" style={{ fontSize: 26 }}>🔥 Combo ×{combo}</span>
          <span style={{ fontSize: 14 }}>⭐ {student.points} pts · Lvl {student.level}</span>
        </div>

        <div style={{ height: 8, borderRadius: 999, background: "rgba(251,248,242,0.15)", overflow: "hidden", marginBottom: 22 }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct > 30 ? "var(--chalk-mint)" : "var(--chalk-coral)",
              transition: "width 1s linear",
            }}
          />
        </div>

        <div className="card" style={{ padding: 26, background: "var(--paper)" }}>
          <p className="eyebrow">Difficulty {question.difficulty} / 5 · {timeLeft}s left</p>
          <h3 style={{ fontSize: 22, marginTop: 10, marginBottom: 20 }}>{question.prompt}</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {question.choices.map((choice, i) => {
              const isCorrectChoice = result && i === result.answerIndex;
              const isWrongChoice = result && selected === i && !result.correct;
              let border = "1.5px solid var(--line)";
              let bg = "white";
              if (result) {
                if (isCorrectChoice) {
                  border = "1.5px solid var(--chalk-mint)";
                  bg = "rgba(111,191,139,0.12)";
                } else if (isWrongChoice) {
                  border = "1.5px solid var(--chalk-coral)";
                  bg = "rgba(232,115,74,0.1)";
                }
              }
              return (
                <button
                  key={i}
                  disabled={!!result}
                  onClick={() => submitAnswer(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border,
                    background: bg,
                    fontSize: 15.5,
                  }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: "var(--paper-dim)" }}>
                    {LETTERS[i]}
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>

          {result && (
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14.5 }}>
                <strong>{result.correct ? `+${roundPoints} points!` : "No points this round."}</strong>
                <p style={{ marginTop: 4 }}>{result.explanation}</p>
              </div>
              <button className="btn btn-primary" onClick={() => loadQuestion(subject.id, difficulty)}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
