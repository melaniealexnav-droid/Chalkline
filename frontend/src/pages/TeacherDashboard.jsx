import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useSession } from "../SessionContext.jsx";

export default function TeacherDashboard() {
  const { teacher } = useSession();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!teacher) {
      navigate("/teacher");
      return;
    }
    refreshClasses();
  }, [teacher]);

  useEffect(() => {
    if (selected) {
      api.getClass(selected, teacher.id).then(setDetail).catch((e) => setError(e.message));
    }
  }, [selected]);

  async function refreshClasses() {
    try {
      const list = await api.myClasses(teacher.id);
      setClasses(list);
      if (list.length && !selected) setSelected(list[0].id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const cls = await api.createClass(newClassName.trim(), teacher.id);
      setNewClassName("");
      await refreshClasses();
      setSelected(cls.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!teacher) return null;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <p className="eyebrow">Teacher dashboard</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>Welcome, {teacher.name}</h1>

      {error && <div className="error-banner" style={{ marginTop: 20 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginTop: 30, alignItems: "start" }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Your classes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: selected === c.id ? "rgba(111,168,216,0.12)" : "white",
                  fontWeight: selected === c.id ? 700 : 500,
                }}
              >
                {c.name}
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Code: {c.joinCode}</div>
              </button>
            ))}
            {classes.length === 0 && <p style={{ fontSize: 13.5 }}>No classes yet — create your first one below.</p>}
          </div>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="className">New class name</label>
              <input id="className" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Period 3 Math" />
            </div>
            <button className="btn btn-dark btn-block" disabled={busy} type="submit">
              {busy ? "Creating…" : "+ Create class"}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {!detail && <p>Select or create a class to see the roster.</p>}
          {detail && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>{detail.name}</h3>
                  <p style={{ fontSize: 13.5 }}>
                    Share this code with students: <strong style={{ color: "var(--ink)" }}>{detail.joinCode}</strong>
                  </p>
                </div>
              </div>

              {detail.students.length === 0 ? (
                <p>No students have joined yet. Write the code on the board — they join at the "I'm a student" link.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ textAlign: "left", borderBottom: "2px solid var(--line)" }}>
                        <th style={{ padding: "8px 6px" }}>Student</th>
                        <th style={{ padding: "8px 6px" }}>Level</th>
                        <th style={{ padding: "8px 6px" }}>Points</th>
                        {["math", "reading", "science", "social-studies", "act"].map((k) => (
                          <th style={{ padding: "8px 6px", textTransform: "capitalize" }} key={k}>
                            {k.replace("-", " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.students.map((s) => (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "8px 6px" }}>
                            {s.avatar} {s.name}
                          </td>
                          <td style={{ padding: "8px 6px" }}>{s.level}</td>
                          <td style={{ padding: "8px 6px" }}>{s.points}</td>
                          {["math", "reading", "science", "social-studies", "act"].map((k) => {
                            const p = s.progress[k];
                            return (
                              <td style={{ padding: "8px 6px" }} key={k}>
                                {p && p.attempts > 0 ? (
                                  <span>
                                    {p.accuracy}% <span style={{ color: "var(--ink-soft)" }}>({p.attempts})</span>
                                    {p.placementLevel ? ` · L${p.placementLevel}` : ""}
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--ink-soft)" }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
