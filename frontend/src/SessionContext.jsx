import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext(null);

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [student, setStudentState] = useState(() => readStorage("chalkline_student"));
  const [teacher, setTeacherState] = useState(() => readStorage("chalkline_teacher"));

  useEffect(() => {
    if (student) localStorage.setItem("chalkline_student", JSON.stringify(student));
    else localStorage.removeItem("chalkline_student");
  }, [student]);

  useEffect(() => {
    if (teacher) localStorage.setItem("chalkline_teacher", JSON.stringify(teacher));
    else localStorage.removeItem("chalkline_teacher");
  }, [teacher]);

  function setStudent(data, className) {
    setStudentState(data ? { ...data, className } : null);
  }
  function updateStudentStats(patch) {
    setStudentState((prev) => (prev ? { ...prev, ...patch } : prev));
  }
  function setTeacher(data) {
    setTeacherState(data);
  }
  function logoutStudent() {
    setStudentState(null);
  }
  function logoutTeacher() {
    setTeacherState(null);
  }

  return (
    <SessionContext.Provider
      value={{ student, setStudent, updateStudentStats, logoutStudent, teacher, setTeacher, logoutTeacher }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
