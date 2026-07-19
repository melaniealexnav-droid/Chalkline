import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import ChalkTrail from "../components/ChalkTrail.jsx";

const MODES = [
  { key: "diagnostic", title: "Diagnostic", desc: "A short placement test to find your starting level.", icon: "🎯" },
  { key: "practice", title: "Adaptive Practice", desc: "Questions that get harder or easier as you go.", icon: "📈" },
  { key: "lessons", title: "Lessons", desc: "Short teacher-written lessons with a quiz at the end.", icon: "📘" },
  { key: "game", title: "Game Mode", desc: "Same questions, streaks, points, and level-ups.", icon: "🕹️" },
];

export default function SubjectPortal() {
  const { subjectKey } = useParams();
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState("");
  const { student } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSubject(subjectKey).then(setSubject).catch((e) => setError(e.message));
  }, [subjectKey]);

  useEffect(() => {
    if (!student) navigate("/join");
  }, [student]);

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject || !student) return null;

  const progress = student.progress?.[subjectKey];

  return (
    <div>
      <section style={{ background: subject.color, color: "white", padding: "44px 0" }}>
        <div className="container">
          <Link to="/" style={{ fontSize: 13, opacity: 0.85, textDecoration: "none", color: "white" }}>← All portals</Link>
          <h1 style={{ fontSize: 34, marginTop: 10 }}>{subject.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 8 }}>
            {subject.topics.length} topics · {student.avatar} {student.name}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 34, paddingBottom: 70 }}>
        <div style={{ maxWidth: 420, marginBottom: 34 }}>
          <ChalkTrail progress={0.3} color={subject.color} label="pick a mode" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              className="card"
              onClick={() => navigate(`/portal/${subjectKey}/${m.key}`)}
              style={{ padding: 22, textAlign: "left", border: "none" }}
            >
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <h3 style={{ fontSize: 18, marginTop: 12 }}>{m.title}</h3>
              <p style={{ fontSize: 13.5, marginTop: 6 }}>{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="card" style={{ marginTop: 34, padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>Topics in this portal</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {subject.topics.map((t) => (
              <span key={t.id} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 999, background: "var(--paper-dim)" }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
