import React, { useEffect, useState } from "react";

export default function LevelUpToast({ level, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone && onDone();
    }, 2200);
    return () => clearTimeout(t);
  }, [level]);

  if (!visible) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--chalkboard)",
        color: "var(--paper)",
        padding: "14px 26px",
        borderRadius: 999,
        boxShadow: "var(--shadow)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "dropIn 0.35s ease",
      }}
    >
      <span style={{ fontSize: 20 }}>⭐</span>
      <span className="chalk-label" style={{ fontSize: 24 }}>
        Level {level}! Keep going.
      </span>
      <style>{`@keyframes dropIn { from { opacity:0; transform: translate(-50%, -10px);} to { opacity:1; transform: translate(-50%, 0);} }`}</style>
    </div>
  );
}
