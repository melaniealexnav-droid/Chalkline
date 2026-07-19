import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";

const AVATARS = ["🦉", "🦊", "🐢", "🐙", "🐝", "🐧", "🦁", "🐳"];

export default function JoinClass() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { setStudent } = useSession();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { student, className } = await api.joinClass({ code, name, avatar });
      setStudent(student, className);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-page">
      <form className="card" onSubmit={handleSubmit} style={{ padding: 34, width: 400, textAlign: "center" }}>
        <p className="eyebrow">Student sign-in</p>
        <h2 style={{ fontSize: 26, marginTop: 8, marginBottom: 24 }}>Join your class</h2>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label htmlFor="code">Class code (from your teacher)</label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. GSCE68"
            maxLength={6}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="name">Your first name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Melo" required />
        </div>
        <div className="field">
          <label>Pick an avatar</label>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: 22,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: avatar === a ? "2px solid var(--chalk-gold)" : "1.5px solid var(--line)",
                  background: avatar === a ? "rgba(242,193,78,0.15)" : "white",
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Joining…" : "Join class"}
        </button>
      </form>
    </div>
  );
}
