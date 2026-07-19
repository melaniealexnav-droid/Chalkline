import React, { useEffect, useRef, useState } from "react";

// progress: 0..1
// color: stroke color for the filled portion
export default function ChalkTrail({ progress = 0, color = "var(--chalk-gold)", label }) {
  const pathRef = useRef(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, []);

  const clamped = Math.max(0, Math.min(1, progress));
  const offset = length - length * clamped;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg viewBox="0 0 320 40" width="100%" height="40" style={{ flex: 1 }} preserveAspectRatio="none">
        <path
          d="M4 30 Q 40 6, 76 24 T 148 20 T 220 26 T 316 12"
          fill="none"
          stroke="var(--line)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="1 12"
        />
        <path
          ref={pathRef}
          d="M4 30 Q 40 6, 76 24 T 148 20 T 220 26 T 316 12"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {label && <span className="chalk-label" style={{ whiteSpace: "nowrap" }}>{label}</span>}
    </div>
  );
}
