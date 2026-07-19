import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import JoinClass from "./pages/JoinClass.jsx";
import TeacherAuth from "./pages/TeacherAuth.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import SubjectPortal from "./pages/SubjectPortal.jsx";
import Diagnostic from "./pages/Diagnostic.jsx";
import AdaptivePractice from "./pages/AdaptivePractice.jsx";
import Lessons from "./pages/Lessons.jsx";
import GameMode from "./pages/GameMode.jsx";
import ACTPortal from "./pages/ACTPortal.jsx";
import ACTSection from "./pages/ACTSection.jsx";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinClass />} />
        <Route path="/teacher" element={<TeacherAuth />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        <Route path="/portal/act" element={<ACTPortal />} />
        <Route path="/portal/act/section/:topicId" element={<ACTSection />} />

        <Route path="/portal/:subjectKey" element={<SubjectPortal />} />
        <Route path="/portal/:subjectKey/diagnostic" element={<Diagnostic />} />
        <Route path="/portal/:subjectKey/practice" element={<AdaptivePractice />} />
        <Route path="/portal/:subjectKey/lessons" element={<Lessons />} />
        <Route path="/portal/:subjectKey/game" element={<GameMode />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
