import { find } from "../db.js";

// Minimal auth: the client stores the teacher's id (issued at login) and
// sends it back as a bearer token. This is intentionally simple so a
// school with no IT staff can run the whole stack on one machine.
//
// IMPORTANT before a real deployment with real student data: put this
// behind HTTPS, and replace this token scheme with signed, expiring
// sessions (e.g. a JWT with a secret in an environment variable) before
// storing any real student information. See README "Before you go live".
export function requireTeacher(req, res, next) {
  const auth = req.headers.authorization || "";
  const teacherId = auth.replace("Bearer ", "").trim();
  const teacher = find("teachers", (t) => t.id === teacherId);
  if (!teacher) {
    return res.status(401).json({ error: "Please log in as a teacher to do this." });
  }
  req.teacher = teacher;
  next();
}
