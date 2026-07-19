import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";
import QuestionCard from "../components/QuestionCard.jsx";

const SECONDS_PER_QUESTION = 45;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ACTSection() {
  const { topicId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [set, setSet] = useState([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const { student } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getSubject("act");
        setSubject(s);
        const t = s.topics.find((x) => x.id === topicId);
        setTopic(t);
        const qs = await api.diagnosticSet({ subjectId: s.id, topicId });
        setSet(qs);
        setSecondsLeft(qs.length * SECONDS_PER_QUESTION);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [topicId]);

  useEffect(() => {
    if (secondsLeft == null || finished) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [secondsLeft == null, finished]);

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject || !topic || set.length === 0 || !student) {
    return <div className="container" style={{ paddingTop: 40 }}><p>Loading section…</p></div>;
  }

  const current = set[index];

  async function handleSubmit(selectedIndex) {
    const res = await api.checkQuestion(current.id, selectedIndex);
    if (res.correct) setCorrectCount((n) => n + 1);
    return res;
  }

  function handleNext() {
    if (index + 1 < set.length) {
      setIndex(index + 1);
    } else {
      clearInterval(timerRef.current);
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <p className="eyebrow">{topic.name} section complete</p>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>{correctCount} / {set.length} correct</h1>
        <p style={{ marginTop: 12 }}>Nice work grinding through a timed section — that's the real skill the ACT tests, not just content.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <button className="btn btn-primary" onClick={() => navigate("/portal/act")}>
            Choose another section
          </button>
          <button className="btn btn-dark" onClick={() => navigate("/")}>
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 620, margin: "0 auto" }}>
      <Link to="/portal/act" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-soft)" }}>← Exit section</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0" }}>
        <p className="eyebrow">{topic.name} · Question {index + 1} of {set.length}</p>
        <span
          style={{
            fontFamily: "var(--font-chalk)",
            fontSize: 22,
            color: secondsLeft < 30 ? "var(--chalk-coral)" : "var(--ink)",
          }}
        >
          ⏱ {formatTime(secondsLeft)}
        </span>
      </div>
      <QuestionCard
        question={current}
        onSubmit={handleSubmit}
        onNext={handleNext}
        accentColor={subject.color}
        footerExtra="Section time keeps running between questions, just like test day."
      />
    </div>
  );
}
