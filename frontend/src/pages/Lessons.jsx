import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import QuestionCard from "../components/QuestionCard.jsx";

export default function Lessons() {
  const { subjectKey } = useParams();
  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [active, setActive] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [error, setError] = useState("");
  const { student, updateStudentStats } = useSession();

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getSubject(subjectKey);
        setSubject(s);
        const l = await api.getLessons({ subjectId: s.id });
        setLessons(l);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [subjectKey]);

  async function startQuiz() {
    setQuizQuestion(null);
    try {
      const q = await api.nextQuestion({ subjectId: subject.id, topicId: active.topicId || "", difficulty: 3 });
      setQuizQuestion(q);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSubmit(selectedIndex) {
    const res = await api.submitAttempt({
      studentId: student.id,
      questionId: quizQuestion.id,
      selectedIndex,
      difficultyAtAttempt: quizQuestion.difficulty,
    });
    updateStudentStats({ points: res.totalPoints, level: res.level, streak: res.streak });
    return res;
  }

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject) return <div className="container" style={{ paddingTop: 40 }}><p>Loading lessons…</p></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <Link to={`/portal/${subjectKey}`} style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-soft)" }}>← Back to portal</Link>
      <p className="eyebrow" style={{ marginTop: 18 }}>{subject.name} · Lessons</p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, marginTop: 20, alignItems: "start" }}>
        <div className="card" style={{ padding: 16 }}>
          {lessons.length === 0 && <p style={{ fontSize: 13.5 }}>No lessons published for this portal yet.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setActive(l);
                  setQuizQuestion(null);
                }}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: active?.id === l.id ? "rgba(111,168,216,0.12)" : "white",
                  fontWeight: active?.id === l.id ? 700 : 500,
                  fontSize: 14,
                }}
              >
                {l.title}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 26, minHeight: 260 }}>
          {!active && <p>Pick a lesson on the left to start reading.</p>}
          {active && !quizQuestion && (
            <>
              <h2 style={{ fontSize: 24 }}>{active.title}</h2>
              <p style={{ marginTop: 14, fontSize: 15.5, color: "var(--ink)" }}>{active.body}</p>
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={startQuiz}>
                Take the quick check →
              </button>
            </>
          )}
          {quizQuestion && (
            <QuestionCard
              question={quizQuestion}
              onSubmit={handleSubmit}
              onNext={() => setQuizQuestion(null)}
              accentColor={subject.color}
              footerExtra="One question to check understanding."
            />
          )}
        </div>
      </div>
    </div>
  );
}
