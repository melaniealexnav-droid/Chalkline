import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";

export default function ACTPortal() {
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState("");
  const { student } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSubject("act").then(setSubject).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!student) navigate("/join");
  }, [student]);

  if (error) return <div className="container" style={{ paddingTop: 40 }}><div className="error-banner">{error}</div></div>;
  if (!subject || !student) return null;

  return (
    <div>
      <section style={{ background: subject.color, color: "white", padding: "44px 0" }}>
        <div className="container">
          <Link to="/" style={{ fontSize: 13, opacity: 0.85, textDecoration: "none", color: "white" }}>← All portals</Link>
          <h1 style={{ fontSize: 34, marginTop: 10 }}>ACT Prep</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 8 }}>
            Timed, section-by-section practice — English, Math, Reading, and Science, the same order as the real test.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 34, paddingBottom: 70 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
          {subject.topics.map((t, i) => (
            <button
              key={t.id}
              className="card"
              onClick={() => navigate(`/portal/act/section/${t.id}`)}
              style={{ padding: 22, textAlign: "left", border: "none", borderTop: `5px solid ${subject.color}` }}
            >
              <p className="eyebrow">Section {i + 1}</p>
              <h3 style={{ fontSize: 20, marginTop: 8 }}>{t.name}</h3>
              <p style={{ fontSize: 13.5, marginTop: 6 }}>Timed practice set with instant scoring.</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
