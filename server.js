// Al'Ansar Academy - web server + SQLite database (no installs needed, Node 22.5+)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const db = new DatabaseSync(path.join(ROOT, 'school.db'));
db.exec('PRAGMA foreign_keys = ON');

// ---------- 1. TABLES ----------
db.exec(`
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  class_id INTEGER REFERENCES classes(id),
  previous_school TEXT,
  father_name TEXT, mother_name TEXT,
  guardian_phone TEXT, guardian_email TEXT, home_address TEXT,
  emergency_name TEXT, emergency_relationship TEXT, emergency_phone TEXT,
  allergies TEXT, medications TEXT, doctor_name TEXT, doctor_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  admitted_on TEXT DEFAULT (date('now'))
);
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,            -- Teacher / Support / Director
  subjects TEXT,
  qualification TEXT,
  phone TEXT, email TEXT, address TEXT,
  date_joined TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,            -- student / teacher
  applicant_name TEXT NOT NULL,
  data TEXT NOT NULL,            -- all form answers (JSON)
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_on TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, session TEXT NOT NULL, term TEXT NOT NULL,
  class_id INTEGER REFERENCES classes(id),
  ca_max REAL NOT NULL DEFAULT 40, exam_max REAL NOT NULL DEFAULT 60,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  ca_score REAL NOT NULL DEFAULT 0, exam_score REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0, grade TEXT NOT NULL, remark TEXT NOT NULL,
  UNIQUE(exam_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam ON results(exam_id);
`);
for (const c of ['Pre-nursery', 'Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2'])
  db.prepare('INSERT OR IGNORE INTO classes (name) VALUES (?)').run(c);

// ---------- 2. ADMIN LOGIN ----------
const hashPw = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
const checkPw = (pw, stored) => {
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex'), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
if (!db.prepare('SELECT id FROM admins LIMIT 1').get()) {
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(5).toString('hex');
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hashPw(pw));
  console.log('\n=== FIRST RUN: admin account created ===');
  console.log('Username: admin');
  console.log('Password: ' + pw + '   (write it down - it is shown only once)\n');
}
const sessions = new Map(); // token -> expiry time
const isAdmin = (req) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  const exp = sessions.get(t);
  if (exp && exp > Date.now()) return true;
  sessions.delete(t);
  return false;
};
const fails = new Map(); // ip -> {count, until}

// ---------- 3. HELPERS ----------
const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};
const readBody = (req) => new Promise((resolve, reject) => {
  let s = '';
  req.on('data', (d) => { s += d; if (s.length > 100000) { reject(new Error('too big')); req.destroy(); } });
  req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
});
const clean = (v, max = 300) => (v == null ? null : String(v).trim().slice(0, max));
const pick = (b, fields) => Object.fromEntries(fields.map((f) => [f, clean(b[f])]));

const STUDENT_FIELDS = ['full_name', 'date_of_birth', 'gender', 'class_id', 'previous_school', 'father_name',
  'mother_name', 'guardian_phone', 'guardian_email', 'home_address', 'emergency_name', 'emergency_relationship',
  'emergency_phone', 'allergies', 'medications', 'doctor_name', 'doctor_phone', 'status'];
const STAFF_FIELDS = ['full_name', 'role', 'subjects', 'qualification', 'phone', 'email', 'address', 'date_joined', 'status'];

function nextAdmissionNo() {
  const year = new Date().getFullYear();
  const row = db.prepare("SELECT COUNT(*) n FROM students WHERE admission_no LIKE ?").get(`ALA/${year}/%`);
  let n = row.n + 1, no;
  do { no = `ALA/${year}/${String(n++).padStart(3, '0')}`; }
  while (db.prepare('SELECT 1 FROM students WHERE admission_no=?').get(no));
  return no;
}
function insertRow(table, fields, data) {
  const cols = fields.filter((f) => data[f] != null && data[f] !== '');
  const r = db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
    .run(...cols.map((c) => data[c]));
  return r.lastInsertRowid;
}
function updateRow(table, fields, id, data) {
  db.prepare(`UPDATE ${table} SET ${fields.map((f) => f + '=?').join(',')} WHERE id=?`)
    .run(...fields.map((f) => data[f]), id);
}

// ---------- 4. API ----------
async function api(req, res, url) {
  const m = req.method, p = url.pathname;
  const body = ['POST', 'PUT'].includes(m) ? await readBody(req) : {};

  // PUBLIC: parents/teachers submit applications (write-only)
  if (m === 'POST' && (p === '/api/apply/student' || p === '/api/apply/teacher')) {
    const type = p.endsWith('student') ? 'student' : 'teacher';
    const data = {};
    for (const [k, v] of Object.entries(body)) if (k !== 'website') data[k.slice(0, 50)] = clean(v, 500);
    if (body.website) return send(res, 200, { ok: true });          // spam trap
    if (!data.full_name) return send(res, 400, { error: 'Full name is required' });
    db.prepare('INSERT INTO applications (type, applicant_name, data) VALUES (?,?,?)')
      .run(type, data.full_name, JSON.stringify(data));
    return send(res, 201, { ok: true });
  }
  if (m === 'GET' && p === '/api/classes')
    return send(res, 200, db.prepare('SELECT * FROM classes ORDER BY id').all());

  // LOGIN
  if (m === 'POST' && p === '/api/login') {
    const ip = req.socket.remoteAddress, f = fails.get(ip) || { count: 0, until: 0 };
    if (f.until > Date.now()) return send(res, 429, { error: 'Too many attempts. Wait a few minutes.' });
    const a = db.prepare('SELECT * FROM admins WHERE username=?').get(clean(body.username, 50) || '');
    if (!a || !checkPw(String(body.password || ''), a.password_hash)) {
      f.count++; if (f.count >= 5) { f.until = Date.now() + 5 * 60000; f.count = 0; }
      fails.set(ip, f);
      return send(res, 401, { error: 'Wrong username or password' });
    }
    fails.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + 8 * 3600 * 1000);
    return send(res, 200, { token });
  }

  // EVERYTHING BELOW NEEDS ADMIN LOGIN
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in' });
  const idMatch = p.match(/^\/api\/(students|staff|applications)\/(\d+)(\/approve)?$/);
  const id = idMatch && Number(idMatch[2]);

  if (m === 'GET' && p === '/api/stats') return send(res, 200, {
    students: db.prepare("SELECT COUNT(*) n FROM students WHERE status='active'").get().n,
    staff: db.prepare("SELECT COUNT(*) n FROM staff WHERE status='active'").get().n,
    pending: db.prepare("SELECT COUNT(*) n FROM applications WHERE status='pending'").get().n });

  if (m === 'GET' && p === '/api/students') {
    const q = '%' + (url.searchParams.get('q') || '') + '%';
    return send(res, 200, db.prepare(`SELECT s.*, c.name AS class_name FROM students s
      LEFT JOIN classes c ON c.id=s.class_id WHERE s.full_name LIKE ? OR s.admission_no LIKE ?
      ORDER BY s.id DESC`).all(q, q));
  }
  if (m === 'POST' && p === '/api/students') {
    const d = pick(body, STUDENT_FIELDS);
    if (!d.full_name) return send(res, 400, { error: 'Full name is required' });
    d.admission_no = nextAdmissionNo(); d.status = d.status || 'active';
    return send(res, 201, { id: insertRow('students', [...STUDENT_FIELDS, 'admission_no'], d), admission_no: d.admission_no });
  }
  if (m === 'PUT' && idMatch?.[1] === 'students') {
    const d = pick(body, STUDENT_FIELDS);
    if (!d.full_name) return send(res, 400, { error: 'Full name is required' });
    updateRow('students', STUDENT_FIELDS, id, d); return send(res, 200, { ok: true });
  }
  if (m === 'DELETE' && idMatch?.[1] === 'students') {
    db.prepare('DELETE FROM students WHERE id=?').run(id); return send(res, 200, { ok: true });
  }

  if (m === 'GET' && p === '/api/staff') return send(res, 200, db.prepare('SELECT * FROM staff ORDER BY id DESC').all());
  if (m === 'POST' && p === '/api/staff') {
    const d = pick(body, STAFF_FIELDS);
    if (!d.full_name || !d.role) return send(res, 400, { error: 'Name and role are required' });
    d.status = d.status || 'active';
    return send(res, 201, { id: insertRow('staff', STAFF_FIELDS, d) });
  }
  if (m === 'PUT' && idMatch?.[1] === 'staff') {
    const d = pick(body, STAFF_FIELDS);
    if (!d.full_name || !d.role) return send(res, 400, { error: 'Name and role are required' });
    updateRow('staff', STAFF_FIELDS, id, d); return send(res, 200, { ok: true });
  }
  if (m === 'DELETE' && idMatch?.[1] === 'staff') {
    db.prepare('DELETE FROM staff WHERE id=?').run(id); return send(res, 200, { ok: true });
  }

  // EXAMINATIONS AND RESULT MANAGEMENT
  if (m === 'GET' && p === '/api/exams') return send(res, 200, db.prepare(`SELECT e.*, c.name AS class_name,
    (SELECT COUNT(*) FROM results r WHERE r.exam_id=e.id) AS result_count
    FROM exams e LEFT JOIN classes c ON c.id=e.class_id ORDER BY e.id DESC`).all());
  if (m === 'POST' && p === '/api/exams') {
    const title=clean(body.title,120), session=clean(body.session,30), term=clean(body.term,30);
    const classId=Number(body.class_id), caMax=Number(body.ca_max), examMax=Number(body.exam_max);
    if (!title || !session || !term || !classId || !(caMax>0) || !(examMax>0))
      return send(res,400,{error:'Enter exam title, session, term, class and valid maximum scores.'});
    const r=db.prepare('INSERT INTO exams (title,session,term,class_id,ca_max,exam_max) VALUES (?,?,?,?,?,?)')
      .run(title,session,term,classId,caMax,examMax);
    return send(res,201,{id:r.lastInsertRowid});
  }
  if (m === 'GET' && p === '/api/results') {
    const examId=Number(url.searchParams.get('exam_id'));
    if (!examId) return send(res,400,{error:'Select an examination.'});
    return send(res,200,db.prepare(`SELECT r.*,s.admission_no,s.full_name,c.name AS class_name,
      e.title AS exam_title,e.session,e.term,e.ca_max,e.exam_max FROM results r
      JOIN students s ON s.id=r.student_id JOIN exams e ON e.id=r.exam_id
      LEFT JOIN classes c ON c.id=s.class_id WHERE r.exam_id=? ORDER BY s.full_name`).all(examId));
  }
  if (m === 'POST' && p === '/api/results') {
    const examId=Number(body.exam_id), studentId=Number(body.student_id);
    const exam=db.prepare('SELECT * FROM exams WHERE id=?').get(examId);
    const student=db.prepare('SELECT * FROM students WHERE id=?').get(studentId);
    const ca=Number(body.ca_score), score=Number(body.exam_score);
    if (!exam || !student || !Number.isFinite(ca) || !Number.isFinite(score) || ca<0 || ca>exam.ca_max || score<0 || score>exam.exam_max)
      return send(res,400,{error:'Invalid student, examination or score. Check the maximum marks.'});
    if (student.class_id!==exam.class_id) return send(res,400,{error:'Student is not in the examination class.'});
    const total=ca+score, pct=total/(exam.ca_max+exam.exam_max)*100;
    const grade=pct>=70?'A':pct>=60?'B':pct>=50?'C':pct>=45?'D':pct>=40?'E':'F';
    const remark=pct>=70?'Excellent':pct>=60?'Very Good':pct>=50?'Good':pct>=45?'Pass':pct>=40?'Fair':'Needs Improvement';
    db.prepare(`INSERT INTO results (exam_id,student_id,ca_score,exam_score,total,grade,remark) VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(exam_id,student_id) DO UPDATE SET ca_score=excluded.ca_score,exam_score=excluded.exam_score,
      total=excluded.total,grade=excluded.grade,remark=excluded.remark`).run(examId,studentId,ca,score,total,grade,remark);
    return send(res,200,{ok:true,total,grade,remark});
  }
  if (m === 'GET' && p === '/api/class-students') {
    return send(res,200,db.prepare(`SELECT id,admission_no,full_name FROM students
      WHERE class_id=? AND status='active' ORDER BY full_name`).all(Number(url.searchParams.get('class_id'))));
  }
  if (m === 'GET' && p === '/api/applications')
    return send(res, 200, db.prepare('SELECT * FROM applications ORDER BY id DESC').all()
      .map((a) => ({ ...a, data: JSON.parse(a.data) })));
  if (m === 'POST' && idMatch?.[1] === 'applications' && idMatch[3]) {      // approve
    const a = db.prepare('SELECT * FROM applications WHERE id=?').get(id);
    if (!a || a.status !== 'pending') return send(res, 400, { error: 'Not pending' });
    const x = JSON.parse(a.data);
    if (a.type === 'student') {
      const cls = db.prepare('SELECT id FROM classes WHERE name=?').get(x.class_name || '');
      const d = { ...pick(x, STUDENT_FIELDS), class_id: cls?.id ?? null, status: 'active', admission_no: nextAdmissionNo() };
      insertRow('students', [...STUDENT_FIELDS, 'admission_no'], d);
    } else {
      insertRow('staff', STAFF_FIELDS, { ...pick(x, STAFF_FIELDS), role: 'Teacher', status: 'active' });
    }
    db.prepare("UPDATE applications SET status='approved' WHERE id=?").run(id);
    return send(res, 200, { ok: true });
  }
  if (m === 'DELETE' && idMatch?.[1] === 'applications') {
    db.prepare('DELETE FROM applications WHERE id=?').run(id); return send(res, 200, { ok: true });
  }
  send(res, 404, { error: 'Not found' });
}

// ---------- 5. WEB PAGES ----------
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const PUBLIC_DIRS = ['css', 'js'];

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let name = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const top = name.split('/')[0];
    const ok = (name.endsWith('.html') && !name.includes('/')) || PUBLIC_DIRS.includes(top);
    const file = path.join(ROOT, name);
    if (!ok || !file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Page not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Server error' });
  }
}).listen(PORT, () => console.log(`School website running at http://localhost:${PORT}`));
