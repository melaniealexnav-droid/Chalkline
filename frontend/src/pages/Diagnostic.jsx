import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import ChalkTrail from "../components/ChalkTrail.jsx";

export default function Diagnostic() {
  const { subjectKey } = useParams();
  const [subject, setSubject] = useState(null);
  const [set, setSet] = useState([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { student } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getSubject(subjectKey);
        setSubject(s);
        const qs = await api.diagnosticSet({ subjectId: s.id });
        setSet(qs);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [subjectKey]);

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!student) return null;
  if (!subject || set.length === 0) return <div className="container" style={{ paddingTop: 40 }}><p>Loading diagnostic…</p></div>;

  const current = set[index];

  async function handleSubmit(selectedIndex) {
    const res = await api.checkQuestion(current.id, selectedIndex);
    setResponses((r) => [...r, { questionId: current.id, selectedIndex }]);
    return res;
  }

  async function handleNext() {
    if (index + 1 < set.length) {
      setIndex(index + 1);
    } else {
      try {
        const finalResult = await api.submitDiagnostic({ studentId: student.id, subjectId: subject.id, responses });
        setResult(finalResult);
      } catch (e) {
        setError(e.message);
      }
    }
  }

  if (result) {
    return (
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <p className="eyebrow">Diagnostic complete</p>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>You're placed at Level {result.placementLevel} / 5</h1>
        <p style={{ marginTop: 12 }}>
          {result.score} of {result.total} correct ({result.ratio}% weighted score). Adaptive Practice will start near this level and adjust as you go.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <button className="btn btn-primary" onClick={() => navigate(`/portal/${subjectKey}/practice`)}>
            Start Adaptive Practice
          </button>
          <button className="btn btn-dark" onClick={() => navigate(`/portal/${subjectKey}`)}>
            Back to portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 620, margin: "0 auto" }}>
      <Link to={`/portal/${subjectKey}`} style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-soft)" }}>← Exit diagnostic</Link>
      <p className="eyebrow" style={{ marginTop: 18 }}>{subject.name} · Diagnostic</p>
      <div style={{ margin: "14px 0 26px" }}>
        <ChalkTrail progress={index / set.length} color={subject.color} label={`${index + 1} / ${set.length}`} />
      </div>
      <QuestionCard
        question={current}
        onSubmit={handleSubmit}
        onNext={handleNext}
        accentColor={subject.color}
        footerExtra="Take your time — this sets your starting point, not a grade."
      />
    </div>
  );
}
