import React from "react";
import { useNavigate } from "react-router-dom";

const ICONS = {
  compass: (c) => (
    <>
      <circle cx="18" cy="18" r="14" stroke={c} strokeWidth="2.5" fill="none" />
      <path d="M23 13l-7 3-2 7 7-3 2-7z" fill={c} />
    </>
  ),
  book: (c) => (
    <>
      <path d="M8 8c3-2 7-2 10 0v16c-3-2-7-2-10 0V8z" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 8c-3-2-7-2-10 0v16c3-2 7-2 10 0V8z" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  flask: (c) => (
    <>
      <path d="M14 6h8M15 6v9l-6 12a2 2 0 002 3h12a2 2 0 002-3l-6-12V6" fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 22h14" stroke={c} strokeWidth="2.5" />
    </>
  ),
  globe: (c) => (
    <>
      <circle cx="18" cy="18" r="13" stroke={c} strokeWidth="2.5" fill="none" />
      <path d="M5 18h26M18 5c4 4 4 22 0 26M18 5c-4 4-4 22 0 26" stroke={c} strokeWidth="2" fill="none" />
    </>
  ),
  target: (c) => (
    <>
      <circle cx="18" cy="18" r="13" stroke={c} strokeWidth="2.5" fill="none" />
      <circle cx="18" cy="18" r="7" stroke={c} strokeWidth="2.5" fill="none" />
      <circle cx="18" cy="18" r="2" fill={c} />
    </>
  ),
};

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();
  const icon = ICONS[subject.icon] || ICONS.compass;

  return (
    <button
      className="card"
      onClick={() => navigate(subject.isAct ? "/portal/act" : `/portal/${subject.key}`)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "flex-start",
        padding: 26,
        textAlign: "left",
        border: "none",
        borderTop: `5px solid ${subject.color}`,
        width: "100%",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36">{icon(subject.color)}</svg>
      <div>
        <h3 style={{ fontSize: 22 }}>{subject.name}</h3>
        <p style={{ marginTop: 6, fontSize: 14 }}>
          {subject.isAct
            ? "Timed section practice: English, Math, Reading, Science."
            : `Diagnostic, adaptive practice, lessons, and game mode.`}
        </p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: subject.color }}>Enter portal →</span>
    </button>
  );
}
