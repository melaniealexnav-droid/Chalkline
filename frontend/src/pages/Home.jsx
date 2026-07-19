import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import SubjectCard from "../components/SubjectCard.jsx";
import ChalkTrail from "../components/ChalkTrail.jsx";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const { student, teacher } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch((e) => setError(e.message));
  }, []);

  const coreSubjects = subjects.filter((s) => !s.isAct);
  const actSubject = subjects.find((s) => s.isAct);

  return (
    <div>
      <section style={{ background: "var(--chalkboard)", color: "var(--paper)", paddingBottom: 90 }}>
        <div className="container" style={{ paddingTop: 64 }}>
          <p className="eyebrow" style={{ color: "var(--chalk-gold)" }}>Free forever · Nothing to buy · Built for real classrooms</p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", maxWidth: 720, marginTop: 14 }}>
            Every subject portal your class needs — without a purchase order.
          </h1>
          <p style={{ color: "rgba(251,248,242,0.8)", fontSize: 18, maxWidth: 600, marginTop: 18 }}>
            Diagnostic placement, adaptive practice, teacher-built lessons, and a full ACT prep track —
            the kind of tools schools usually pay iReady or similar programs for, free for teachers who need them most.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            {!student && (
              <button className="btn btn-primary" onClick={() => navigate("/join")}>
                I'm a student — join my class
              </button>
            )}
            {student && (
              <button className="btn btn-primary" onClick={() => navigate(`/portal/${coreSubjects[0]?.key || ""}`)}>
                Continue as {student.name}
              </button>
            )}
            {!teacher && (
              <button className="btn btn-ghost" onClick={() => navigate("/teacher")}>
                I'm a teacher — set up a class
              </button>
            )}
            {teacher && (
              <button className="btn btn-ghost" onClick={() => navigate("/teacher/dashboard")}>
                Go to my dashboard
              </button>
            )}
          </div>
          <div style={{ marginTop: 46, maxWidth: 420 }}>
            <ChalkTrail progress={0.72} label="always improving" />
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: -56 }}>
        {error && <div className="error-banner">{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {coreSubjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
          {actSubject && <SubjectCard subject={actSubject} />}
        </div>
      </section>

      <section className="container" style={{ marginTop: 80, marginBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
          <div>
            <p className="eyebrow">01 — Diagnose</p>
            <h3 style={{ fontSize: 20, marginTop: 8 }}>Find each student's real starting point</h3>
            <p style={{ marginTop: 8, fontSize: 14.5 }}>A short placement test spans easy to hard questions and places every student on a 1–5 level, per subject.</p>
          </div>
          <div>
            <p className="eyebrow">02 — Practice</p>
            <h3 style={{ fontSize: 20, marginTop: 8 }}>Adaptive questions that grow with them</h3>
            <p style={{ marginTop: 8, fontSize: 14.5 }}>Answer right, the next question gets harder. Answer wrong, it eases up — the same staircase model iReady uses.</p>
          </div>
          <div>
            <p className="eyebrow">03 — Track</p>
            <h3 style={{ fontSize: 20, marginTop: 8 }}>One dashboard, every student, no spreadsheet</h3>
            <p style={{ marginTop: 8, fontSize: 14.5 }}>Teachers see accuracy, placement level, and points per subject for the whole class, live.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
