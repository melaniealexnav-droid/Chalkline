// db.js
// A dependency-free, file-backed JSON data store.
// Why not a "real" database? Underfunded schools often run this on an old
// laptop, a Chromebox, or a shared school server with no DBA and no budget
// for hosted Postgres/MySQL. A single JSON file that lives in /data is
// trivial to back up (just copy the file), trivial to inspect, and needs
// zero native compilation, so `npm install` never fails on old hardware.
//
// If a school later outgrows this (hundreds of concurrent classes), every
// function below is a small, isolated seam — swap the body of each function
// for a real SQL call and nothing in routes/ has to change.

import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function emptyDb() {
  return {
    teachers: [],
    classes: [],
    students: [],
    subjects: [],
    topics: [],
    questions: [],
    lessons: [],
    attempts: [],
    diagnostics: [],
  };
}

let db = emptyDb();

function load() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (existsSync(DATA_FILE)) {
    db = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } else {
    db = emptyDb();
    save();
  }
}

let saveScheduled = false;
function save() {
  // Debounce writes slightly so a burst of requests doesn't thrash the disk.
  if (saveScheduled) return;
  saveScheduled = true;
  setTimeout(() => {
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    saveScheduled = false;
  }, 50);
}

export function id() {
  return randomUUID();
}

export function joinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

// ---- password hashing (built-in crypto only, no bcrypt dependency) ----
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const check = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  return original.length === check.length && timingSafeEqual(original, check);
}

// ---- generic table helpers ----
export const table = (name) => db[name];
export function insert(name, row) {
  const record = { id: id(), createdAt: new Date().toISOString(), ...row };
  db[name].push(record);
  save();
  return record;
}
export function update(name, rowId, patch) {
  const row = db[name].find((r) => r.id === rowId);
  if (!row) return null;
  Object.assign(row, patch);
  save();
  return row;
}
export function find(name, predicate) {
  return db[name].find(predicate);
}
export function filter(name, predicate) {
  return db[name].filter(predicate);
}
export function remove(name, rowId) {
  db[name] = db[name].filter((r) => r.id !== rowId);
  save();
}

// ---------------------------------------------------------------------
// Seeding: sample subjects, topics, and a real (if modest) question bank
// so the platform is usable the moment it's installed, with zero setup.
// Teachers can add far more content later via the /api/questions POST
// route or by editing backend/data/db.json directly.
// ---------------------------------------------------------------------
function seedIfEmpty() {
  if (db.subjects.length > 0) return;

  const subjects = [
    { key: "math", name: "Math", color: "#2E86AB", icon: "compass" },
    { key: "reading", name: "Reading", color: "#C0533E", icon: "book" },
    { key: "science", name: "Science", color: "#3E8E5B", icon: "flask" },
    { key: "social-studies", name: "Social Studies", color: "#8A5CB0", icon: "globe" },
    { key: "act", name: "ACT Prep", color: "#D6A426", icon: "target", isAct: true },
  ];
  const subjectRecords = {};
  for (const s of subjects) {
    subjectRecords[s.key] = insert("subjects", s);
  }

  function addTopic(subjectKey, name, order) {
    return insert("topics", { subjectId: subjectRecords[subjectKey].id, name, order });
  }
  function addQ(subjectKey, topic, difficulty, prompt, choices, answerIndex, explanation) {
    insert("questions", {
      subjectId: subjectRecords[subjectKey].id,
      topicId: topic.id,
      difficulty,
      prompt,
      choices,
      answerIndex,
      explanation,
    });
  }
  function addLesson(subjectKey, topic, title, body, order) {
    insert("lessons", { subjectId: subjectRecords[subjectKey].id, topicId: topic.id, title, body, order });
  }

  // ---------------- MATH ----------------
  const mNum = addTopic("math", "Number Sense", 1);
  addQ("math", mNum, 1, "What is 8 + 5?", ["12", "13", "14", "15"], 1, "8 + 5 = 13.");
  addQ("math", mNum, 2, "What is 47 - 19?", ["28", "26", "38", "27"], 0, "47 - 19 = 28.");
  addQ("math", mNum, 3, "What is 12 × 7?", ["82", "84", "74", "94"], 1, "12 × 7 = 84.");
  addLesson("math", mNum, "Place Value Refresher",
    "Every digit in a number has a place value based on its position. In 4,725, the 4 is in the thousands place, 7 is hundreds, 2 is tens, 5 is ones. Breaking numbers apart by place value makes addition and subtraction easier to do in your head.",
    1);

  const mFrac = addTopic("math", "Fractions & Decimals", 2);
  addQ("math", mFrac, 2, "Which fraction is equivalent to 1/2?", ["2/5", "3/6", "2/3", "4/5"], 1, "3/6 simplifies to 1/2.");
  addQ("math", mFrac, 3, "What is 3/4 as a decimal?", ["0.34", "0.75", "0.43", "0.7"], 1, "3 divided by 4 = 0.75.");
  addQ("math", mFrac, 4, "What is 2/3 + 1/6?", ["5/6", "3/9", "1/2", "4/6"], 0, "2/3 = 4/6, plus 1/6 = 5/6.");
  addLesson("math", mFrac, "Comparing Fractions",
    "To compare fractions with different denominators, convert them to a common denominator first, or convert both to decimals. The fraction with the larger resulting value is bigger.",
    1);

  const mGeo = addTopic("math", "Geometry Basics", 3);
  addQ("math", mGeo, 2, "How many sides does a hexagon have?", ["5", "6", "7", "8"], 1, "Hexagon = 6 sides.");
  addQ("math", mGeo, 3, "What is the area of a rectangle 4 units by 9 units?", ["13", "36", "26", "32"], 1, "Area = length × width = 4 × 9 = 36.");
  addQ("math", mGeo, 4, "What is the perimeter of a square with side length 7?", ["14", "49", "28", "21"], 2, "Perimeter = 4 × side = 4 × 7 = 28.");

  const mAlg = addTopic("math", "Intro Algebra", 4);
  addQ("math", mAlg, 3, "Solve for x: x + 9 = 15", ["5", "6", "24", "7"], 1, "x = 15 - 9 = 6.");
  addQ("math", mAlg, 4, "Solve for x: 3x = 21", ["6", "8", "7", "9"], 2, "x = 21 ÷ 3 = 7.");
  addQ("math", mAlg, 5, "Solve for x: 2x + 4 = 18", ["6", "7", "8", "9"], 2, "2x = 18 - 4 = 14, so x = 7.");

  // ---------------- READING ----------------
  const rMain = addTopic("reading", "Main Idea", 1);
  addQ("reading", rMain, 1, "The main idea of a paragraph is usually found:", ["Only in the title", "In the topic sentence or supporting details", "Never stated directly", "Only in footnotes"], 1, "The main idea is often in the topic sentence, supported by details.");
  addQ("reading", rMain, 3, "A summary should:", ["Include every detail from the text", "Capture the key points in fewer words", "Only quote the author", "Be longer than the original"], 1, "A summary condenses the key points.");

  const rVocab = addTopic("reading", "Vocabulary in Context", 2);
  addQ("reading", rVocab, 2, "\"The weary travelers rested at last.\" Weary most nearly means:", ["Excited", "Tired", "Angry", "Curious"], 1, "Weary means very tired.");
  addQ("reading", rVocab, 4, "\"Her candid response surprised the room.\" Candid most nearly means:", ["Honest", "Rude", "Quiet", "Confused"], 0, "Candid means honest and direct.");

  const rInfer = addTopic("reading", "Making Inferences", 3);
  addQ("reading", rInfer, 3, "An inference is:", ["A fact stated directly in the text", "A conclusion drawn from evidence and reasoning", "A random guess", "The title of the passage"], 1, "Inferences combine text evidence with reasoning.");
  addQ("reading", rInfer, 5, "If a character slams a door and refuses to speak, the best inference is that they feel:", ["Joyful", "Upset or angry", "Indifferent", "Sleepy"], 1, "Actions like slamming a door and going silent usually signal anger or upset.");

  // ---------------- SCIENCE ----------------
  const sMethod = addTopic("science", "Scientific Method", 1);
  addQ("science", sMethod, 1, "What is the first step of the scientific method?", ["Form a conclusion", "Ask a question", "Publish results", "Build a model"], 1, "The scientific method starts with a question.");
  addQ("science", sMethod, 3, "A hypothesis is best described as:", ["A proven law", "A testable, educated guess", "An opinion with no evidence", "The final result of an experiment"], 1, "A hypothesis is a testable prediction.");

  const sCells = addTopic("science", "Cells & Life", 2);
  addQ("science", sCells, 2, "Which structure controls what enters and exits a cell?", ["Nucleus", "Cell membrane", "Mitochondria", "Ribosome"], 1, "The cell membrane regulates what passes in and out.");
  addQ("science", sCells, 4, "Which organelle is known as the \"powerhouse of the cell\"?", ["Nucleus", "Chloroplast", "Mitochondria", "Vacuole"], 2, "Mitochondria produce energy (ATP) for the cell.");

  const sEnergy = addTopic("science", "Energy & Forces", 3);
  addQ("science", sEnergy, 2, "What force pulls objects toward the Earth?", ["Friction", "Gravity", "Magnetism", "Tension"], 1, "Gravity pulls objects toward Earth's center.");
  addQ("science", sEnergy, 4, "An object in motion stays in motion unless acted on by an outside force. This is:", ["Newton's Third Law", "Newton's First Law", "The Law of Conservation of Mass", "Boyle's Law"], 1, "This is Newton's First Law, the law of inertia.");

  // ---------------- SOCIAL STUDIES ----------------
  const ssGov = addTopic("social-studies", "Government Basics", 1);
  addQ("social-studies", ssGov, 1, "How many branches does the U.S. federal government have?", ["2", "3", "4", "5"], 1, "Three branches: legislative, executive, judicial.");
  addQ("social-studies", ssGov, 3, "Which branch of government is responsible for making laws?", ["Executive", "Judicial", "Legislative", "Local"], 2, "The legislative branch (Congress) makes laws.");

  const ssGeo = addTopic("social-studies", "Geography", 2);
  addQ("social-studies", ssGeo, 2, "Which of these is a continent?", ["Brazil", "Antarctica", "The Pacific", "The Sahara"], 1, "Antarctica is one of the seven continents.");
  addQ("social-studies", ssGeo, 4, "A country's economy based mainly on farming is called:", ["Industrial", "Agrarian", "Digital", "Maritime"], 1, "An agrarian economy is centered on agriculture.");

  const ssHist = addTopic("social-studies", "U.S. History", 3);
  addQ("social-studies", ssHist, 2, "The U.S. Declaration of Independence was signed in:", ["1776", "1789", "1812", "1865"], 0, "The Declaration of Independence was signed in 1776.");
  addQ("social-studies", ssHist, 4, "The Civil War ended in:", ["1861", "1865", "1900", "1877"], 1, "The Civil War ended in 1865.");

  // ---------------- ACT PREP (sections act as topics, timed) ----------------
  const actEnglish = addTopic("act", "English", 1);
  addQ("act", actEnglish, 2, "Choose the correctly punctuated sentence:", [
    "Although it was raining, we went hiking.",
    "Although it was raining we went hiking.",
    "Although, it was raining we went hiking.",
    "Although it was raining, we, went hiking.",
  ], 0, "A comma follows an introductory dependent clause.");
  addQ("act", actEnglish, 4, "Which revision fixes the sentence? \"Each of the students have their own locker.\"", [
    "Each of the students have his or her own locker.",
    "Each of the students has their own locker.",
    "Each of the student have their own locker.",
    "No change needed.",
  ], 1, "\"Each\" is singular and takes \"has.\"");

  const actMath = addTopic("act", "Math", 2);
  addQ("act", actMath, 3, "If 5x - 3 = 27, what is x?", ["5", "6", "7", "8"], 1, "5x = 30, so x = 6.");
  addQ("act", actMath, 5, "A rectangle's length is 3 more than twice its width. If width = 4, what is the length?", ["7", "10", "11", "14"], 2, "Length = 2(4) + 3 = 11.");

  const actReading = addTopic("act", "Reading", 3);
  addQ("act", actReading, 3, "The primary purpose of a passage's first paragraph is usually to:", [
    "Conclude the argument",
    "Introduce the topic and set context",
    "Cite statistics only",
    "Restate the title",
  ], 1, "Opening paragraphs typically introduce topic and context.");

  const actScience = addTopic("act", "Science", 4);
  addQ("act", actScience, 3, "In a data table showing reaction rate increasing with temperature, the independent variable is:", [
    "Reaction rate",
    "Temperature",
    "Time",
    "The catalyst",
  ], 1, "Temperature is being changed by the experimenter; it's the independent variable.");

  save();
  console.log("Seeded starter subjects, topics, lessons, and question bank.");
}

load();
seedIfEmpty();

export default db;
