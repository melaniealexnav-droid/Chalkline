import React, { useEffect, useState } from "react";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuestionCard({ question, onSubmit, onNext, accentColor = "var(--chalk-blue)", footerExtra }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelected(null);
    setResult(null);
    setBusy(false);
  }, [question?.id]);

  if (!question) return null;

  async function handleSubmit() {
    if (selected == null || busy) return;
    setBusy(true);
    try {
      const res = await onSubmit(selected);
      setResult(res);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ padding: 28, borderTop: `5px solid ${accentColor}` }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>
        {question.difficulty ? `Difficulty ${question.difficulty} / 5` : "Question"}
      </p>
      <h3 style={{ fontSize: 24, marginBottom: 22 }}>{question.prompt}</h3>

      <div style={{ display: "grid", gap: 10 }}>
        {question.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrectChoice = result && i === result.answerIndex;
          const isWrongChoice = result && isSelected && !result.correct;
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
          } else if (isSelected) {
            border = `1.5px solid ${accentColor}`;
            bg = "rgba(111,168,216,0.08)";
          }
          return (
            <button
              key={i}
              onClick={() => !result && setSelected(i)}
              disabled={!!result}
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
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: isSelected || isCorrectChoice ? accentColor : "var(--paper-dim)",
                  color: isSelected || isCorrectChoice ? "white" : "var(--ink-soft)",
                  flexShrink: 0,
                }}
              >
                {LETTERS[i]}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {result && (
        <div
          style={{
            marginTop: 18,
            padding: "14px 16px",
            borderRadius: "var(--radius-sm)",
            background: result.correct ? "rgba(111,191,139,0.14)" : "rgba(232,115,74,0.1)",
            fontSize: 14.5,
          }}
        >
          <strong>{result.correct ? "Nice work — correct!" : "Not quite."}</strong>
          {result.explanation ? <p style={{ marginTop: 4, color: "var(--ink)" }}>{result.explanation}</p> : null}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{footerExtra}</div>
        {!result ? (
          <button className="btn btn-primary" disabled={selected == null || busy} onClick={handleSubmit}>
            {busy ? "Checking…" : "Submit answer"}
          </button>
        ) : (
          <button className="btn btn-dark" onClick={onNext}>
            Next question →
          </button>
        )}
      </div>
    </div>
  );
}
