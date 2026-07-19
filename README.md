# Chalkline — free adaptive learning portals for underfunded schools

A full-stack, self-hosted alternative to the parts of iReady (and similar paid
programs) that teachers usually have to buy: diagnostic placement tests,
adaptive practice that gets harder or easier automatically, short lessons,
a game mode, and a dedicated ACT prep track. Free forever — there's no
license fee anywhere in this codebase, and it's built to run on hardware a
school already has.

## What's inside

- **Math, Reading, Science, and Social Studies portals**, each with:
  - a **Diagnostic** placement test
  - **Adaptive Practice** (staircase difficulty — the same idea iReady uses)
  - **Lessons** with a quick-check quiz
  - **Game Mode** (timer, streak combo, speed bonus)
- A separate **ACT Prep portal** with timed English / Math / Reading / Science sections
- A **teacher dashboard**: create a class, get a join code, watch a live roster
  with per-subject accuracy and placement level — no spreadsheet required
- Students join with just a class code and their first name — no student
  accounts, passwords, or emails needed
- A tiny built-in question bank to start from day one, plus an API route for
  teachers to add their own questions and lessons (see "Adding your own
  content" below)

## Why it's built this way

- **Backend data store is a single JSON file**, not a database server. No
  Postgres, no MySQL, no native modules to compile. `npm install` should work
  even on an old school laptop. Back up the whole platform by copying
  `backend/data/db.json`.
- **No paid services anywhere** — no Firebase, no Auth0, no third-party API
  keys required to run it.
- Every piece (frontend, backend, data store) can be run for free — see
  "Free hosting options" below.

## Running it locally

You need [Node.js](https://nodejs.org) 18 or newer. That's the only
prerequisite.

```bash
# 1. Start the backend (creates and seeds backend/data/db.json on first run)
cd backend
npm install
npm start
# -> Learning platform API running on http://localhost:4000

# 2. In a second terminal, start the frontend
cd frontend
npm install
npm run dev
# -> open the URL it prints, usually http://localhost:5173
```

That's it — open the site, click "I'm a teacher," create a class, and share
the join code with students on the other tab/computer.

## Free hosting options (so the whole school can reach it, not just localhost)

Any of these work with no cost for a single classroom or a small school:

1. **Render.com free web service** for the `backend` folder (Node app), plus
   **Render's free static site** or **Netlify/Vercel free tier** for the
   `frontend` folder (`npm run build` produces a `dist/` folder to deploy).
   Set the frontend's `VITE_API_URL` environment variable to your deployed
   backend's URL before building.
2. **A spare school computer or Chromebox on the school network**, running
   `npm start` in `backend` and a built `frontend` served by any static file
   server (`npx serve dist`). Students on the school Wi-Fi can reach it at
   that machine's local IP address.
3. **Railway.app or Fly.io free tier**, similar idea to Render.

None of these require a credit card for the tiers linked above at time of
writing — but always double-check current pricing pages before committing,
since free tiers change.

## Adding your own content

Two ways:

1. **Through the API** (works today): a logged-in teacher can `POST` to
   `/api/questions` or `/api/lessons` with their auth token. This is meant to
   be wrapped in a "content editor" screen in the future — right now it's
   available so nothing is locked away, but it's raw API access.
2. **Directly in the seed data**: open `backend/db.js` and add more calls to
   `addQ(...)`, `addTopic(...)`, and `addLesson(...)` in the same pattern as
   the existing examples, then delete `backend/data/db.json` and restart the
   server to reseed. (Deleting that file wipes all existing classes/students
   too, so only do this before real students start using it, or export the
   data you care about first.)

## Before you use this with real student data — please read

This is a genuinely working MVP, not a hardened production system. Before
putting real students' names and data in it long-term:

- **Put it behind HTTPS.** As shipped, local/demo traffic is plain HTTP.
- **Harden the teacher login.** The current scheme sends the teacher's ID as
  a bearer token with no expiration. Swap it for signed, expiring sessions
  (e.g. a proper JWT with a secret stored in an environment variable) before
  relying on it to gate real student records.
- **Think through FERPA/COPPA implications** for your school or district.
  Storing student names and performance data, even in a simple JSON file,
  is still storing student education records. Check with your school's data
  privacy policy or IT lead before rolling this out beyond a pilot classroom.
- **Back up `backend/data/db.json` regularly** if you go live — there's no
  automatic backup built in.

## Project structure

```
underfunded-schools-platform/
  backend/
    server.js          # Express app entrypoint
    db.js              # JSON file data store + starter question bank
    middleware/auth.js # lightweight teacher session check
    routes/            # one file per resource (subjects, classes, questions, ...)
  frontend/
    src/
      pages/           # one file per screen/route
      components/      # Navbar, QuestionCard, SubjectCard, ChalkTrail, LevelUpToast
      api.js           # fetch wrapper for the backend
      SessionContext.jsx # student/teacher session, persisted to localStorage
```

## Extending it further

Ideas that fit naturally into this structure if you or another teacher want
to keep building:
- A real content-editor screen in the teacher dashboard (the API already
  supports it)
- Export a class's progress to CSV for report cards
- A "parent view" using the same join-code pattern as students
- More subjects — just add another row to the `subjects` seed in `db.js`
  and it shows up on the home page automatically
