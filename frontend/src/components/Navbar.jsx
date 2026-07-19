import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../SessionContext.jsx";

export default function Navbar() {
  const { student, teacher, logoutStudent, logoutTeacher } = useSession();
  const navigate = useNavigate();

  return (
    <header style={{ background: "var(--chalkboard)", color: "var(--paper)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--paper)" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <rect width="30" height="30" rx="8" fill="var(--chalk-gold)" />
            <path d="M7 20 Q 12 10, 15 16 T 23 9" stroke="var(--chalkboard-dark)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>Chalkline</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14 }}>
          {student && (
            <>
              <span style={{ opacity: 0.85 }}>
                {student.avatar} {student.name} · Lvl {student.level}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: "8px 16px" }}
                onClick={() => {
                  logoutStudent();
                  navigate("/");
                }}
              >
                Switch student
              </button>
            </>
          )}
          {teacher && !student && (
            <>
              <Link to="/teacher/dashboard" style={{ textDecoration: "none", opacity: 0.9 }}>
                Dashboard
              </Link>
              <button
                className="btn btn-ghost"
                style={{ padding: "8px 16px" }}
                onClick={() => {
                  logoutTeacher();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          )}
          {!student && !teacher && (
            <>
              <Link to="/join" style={{ textDecoration: "none", opacity: 0.9 }}>
                I'm a student
              </Link>
              <Link to="/teacher" className="btn btn-dark" style={{ textDecoration: "none", padding: "10px 18px" }}>
                Teacher login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
