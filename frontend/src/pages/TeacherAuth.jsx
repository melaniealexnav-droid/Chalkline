import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";

export default function TeacherAuth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { setTeacher } = useSession();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const teacher =
        mode === "login" ? await api.teacherLogin(form) : await api.teacherSignup(form);
      setTeacher(teacher);
      navigate("/teacher/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-page">
      <form className="card" onSubmit={handleSubmit} style={{ padding: 34, width: 400 }}>
        <p className="eyebrow">Teacher access</p>
        <h2 style={{ fontSize: 26, marginTop: 8, marginBottom: 24 }}>
          {mode === "login" ? "Welcome back" : "Set up your free account"}
        </h2>
        {error && <div className="error-banner">{error}</div>}

        {mode === "signup" && (
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" value={form.name} onChange={set("name")} placeholder="Ms. Rivera" required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">School email</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@school.edu" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={6} />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "One moment…" : mode === "login" ? "Log in" : "Create free account"}
        </button>

        <p style={{ marginTop: 18, fontSize: 14, textAlign: "center" }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ background: "none", border: "none", color: "var(--chalk-blue)", fontWeight: 600, padding: 0 }}
          >
            {mode === "login" ? "Create an account" : "Log in instead"}
          </button>
        </p>
      </form>
    </div>
  );
}
