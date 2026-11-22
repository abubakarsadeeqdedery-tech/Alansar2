// School office dashboard - talks to the database through the server API
let token = sessionStorage.getItem('token');
let view = 'students';
let currentExams = [];
let classes = [];
let editing = null;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  const out = await res.json().catch(() => ({}));
  if (res.status === 401 && token) { logout(); throw new Error('Session ended. Please log in again.'); }
  if (!res.ok) throw new Error(out.error || 'Error');
  return out;
}

const FIELDS = {
  students: [
    ['full_name', 'Full Name *'], ['date_of_birth', 'Date of Birth', 'date'], ['gender', 'Gender', ['Male', 'Female']],
    ['class_id', 'Class', 'class'], ['previous_school', 'Previous School'], ['status', 'Status', ['active', 'graduated', 'left']],
    ['father_name', "Father's Name"], ['mother_name', "Mother's Name"], ['guardian_phone', 'Guardian Phone', 'tel'],
    ['guardian_email', 'Guardian Email', 'email'], ['home_address', 'Home Address'],
    ['emergency_name', 'Emergency Contact'], ['emergency_relationship', 'Relationship'], ['emergency_phone', 'Emergency Phone', 'tel'],
    ['allergies', 'Allergies / Conditions'], ['medications', 'Medications'], ['doctor_name', "Doctor's Name"], ['doctor_phone', "Doctor's Phone", 'tel'],
  ],
  staff: [
    ['full_name', 'Full Name *'], ['role', 'Role *', ['Teacher', 'Support', 'Director']], ['subjects', 'Subjects'],
    ['qualification', 'Qualification'], ['phone', 'Phone', 'tel'], ['email', 'Email', 'email'], ['address', 'Address'],
    ['date_joined', 'Date Joined', 'date'], ['status', 'Status', ['active', 'left']],
  ],
};
const COLUMNS = {
  students: [['admission_no', 'Adm. No'], ['full_name', 'Name'], ['class_name', 'Class'], ['gender', 'Gender'], ['guardian_phone', 'Guardian Phone'], ['status', 'Status']],
  staff: [['full_name', 'Name'], ['role', 'Role'], ['subjects', 'Subjects'], ['phone', 'Phone'], ['status', 'Status']],
};

// ----- login / logout -----
function showDash(on) {
  $('loginView').style.display = on ? 'none' : 'block';
  $('dashView').style.display = on ? 'block' : 'none';
  $('logoutBtn').style.display = on ? 'inline-block' : 'none';
}
function logout() { token = null; sessionStorage.removeItem('token'); showDash(false); }
$('logoutBtn').onclick = logout;
$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('loginMsg');
  try {
    const out = await api('POST', '/api/login', Object.fromEntries(new FormData(e.target)));
    token = out.token; sessionStorage.setItem('token', token); msg.className = 'msg'; e.target.reset(); start();
  } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
});

// ----- lists -----
async function loadStats() {
  const s = await api('GET', '/api/stats');
  $('stStudents').textContent = s.students; $('stStaff').textContent = s.staff; $('stPending').textContent = s.pending;
}
async function loadList() {
  const area = $('listArea');
  $('toolbar').style.display = ['applications','exams','results'].includes(view) ? 'none' : 'flex';
  $('search').style.display = view === 'students' ? 'block' : 'none';
  $('examTools').style.display = view === 'exams' ? 'block' : 'none';
  $('resultTools').style.display = view === 'results' ? 'block' : 'none';
  if (view === 'exams') return loadExams();
  if (view === 'results') return loadResultWorkspace();
  let rows;
  try {
    rows = await api('GET', view === 'students' ? '/api/students?q=' + encodeURIComponent($('search').value) : '/api/' + view);
  } catch (e) { area.textContent = e.message; return; }
  window.rows = rows;
  if (!rows.length) { area.innerHTML = '<p style="padding:20px;background:#fff;border-radius:8px;">Nothing here yet.</p>'; return; }
  if (view === 'applications') {
    area.innerHTML = '<table class="data"><tr><th>Date</th><th>Type</th><th>Name</th><th>Status</th><th></th></tr>' + rows.map((r) =>
      `<tr><td>${esc(r.submitted_on)}</td><td>${esc(r.type)}</td><td>${esc(r.applicant_name)}</td><td>${esc(r.status)}</td><td>
      <button class="small-btn" data-act="view" data-id="${r.id}">View</button>
      ${r.status === 'pending' ? `<button class="small-btn green" data-act="approve" data-id="${r.id}">Approve</button>` : ''}
      <button class="small-btn red" data-act="del" data-id="${r.id}">Delete</button></td></tr>`).join('') + '</table>';
    return;
  }
  const cols = COLUMNS[view];
  area.innerHTML = '<table class="data"><tr>' + cols.map((c) => `<th>${c[1]}</th>`).join('') + '<th></th></tr>' + rows.map((r) =>
    '<tr>' + cols.map((c) => `<td>${esc(r[c[0]])}</td>`).join('') +
    `<td><button class="small-btn" data-act="edit" data-id="${r.id}">Edit</button>
     <button class="small-btn red" data-act="del" data-id="${r.id}">Delete</button></td></tr>`).join('') + '</table>';
}
async function loadExams() {
 const rows=await api('GET','/api/exams'); currentExams=rows;
 $('examClass').innerHTML='<option value="">Select class</option>'+classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 $('listArea').innerHTML=rows.length?'<table class="data"><tr><th>Exam</th><th>Session</th><th>Term</th><th>Class</th><th>Results</th></tr>'+rows.map(r=>`<tr><td>${esc(r.title)}</td><td>${esc(r.session)}</td><td>${esc(r.term)}</td><td>${esc(r.class_name)}</td><td>${r.result_count}</td></tr>`).join('')+'</table>':'<p>No examinations created yet.</p>';
}
async function loadResultWorkspace() {
 currentExams=await api('GET','/api/exams');
 $('resultExam').innerHTML='<option value="">Select examination</option>'+currentExams.map(e=>`<option value="${e.id}">${esc(e.title)} — ${esc(e.class_name)} (${esc(e.session)} ${esc(e.term)})</option>`).join('');
 $('resultStudent').innerHTML='<option value="">Select student</option>'; $('listArea').innerHTML='<p>Select an examination to view saved results.</p>';
}
$('examForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('POST','/api/exams',Object.fromEntries(new FormData(e.target)));e.target.reset();e.querySelector('[name=ca_max]').value=40;e.querySelector('[name=exam_max]').value=60;$('examMsg').textContent='Examination created.';loadExams();}catch(err){$('examMsg').textContent=err.message;}});
$('resultExam').addEventListener('change',async e=>{
 const exam=currentExams.find(x=>x.id===Number(e.target.value));$('resultStudent').innerHTML='<option value="">Select student</option>';if(!exam)return;
 const students=await api('GET','/api/class-students?class_id='+exam.class_id);
 $('resultStudent').innerHTML+=students.map(s=>`<option value="${s.id}">${esc(s.admission_no)} — ${esc(s.full_name)}</option>`).join('');
 const rows=await api('GET','/api/results?exam_id='+exam.id);
 $('listArea').innerHTML=rows.length?'<table class="data"><tr><th>Admission No.</th><th>Student</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr>'+rows.map(r=>`<tr><td>${esc(r.admission_no)}</td><td>${esc(r.full_name)}</td><td>${r.ca_score}</td><td>${r.exam_score}</td><td>${r.total}</td><td>${esc(r.grade)}</td><td>${esc(r.remark)}</td></tr>`).join('')+'</table>':'<p>No results recorded for this examination yet.</p>';
});
$('resultForm').addEventListener('submit',async e=>{e.preventDefault();try{const out=await api('POST','/api/results',Object.fromEntries(new FormData(e.target)));$('resultMsg').textContent=`Saved. Total: ${out.total}; Grade: ${out.grade}; ${out.remark}.`;$('resultExam').dispatchEvent(new Event('change'));}catch(err){$('resultMsg').textContent=err.message;}});
$('printResults').onclick=()=>window.print();
$('listArea').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const id = Number(b.dataset.id), row = window.rows.find((r) => r.id === id);
  try {
    if (b.dataset.act === 'edit') openEdit(row);
    if (b.dataset.act === 'view') openView(row);
    if (b.dataset.act === 'del' && confirm('Delete this record? This cannot be undone.')) {
      await api('DELETE', `/api/${view}/${id}`); refresh();
    }
    if (b.dataset.act === 'approve' && confirm('Approve and add to the school records?')) {
      await api('POST', `/api/applications/${id}/approve`); refresh();
    }
  } catch (err) { alert(err.message); }
});
function openView(r) {
  $('viewBody').innerHTML = '<table class="data">' + Object.entries(r.data).filter(([, v]) => v)
    .map(([k, v]) => `<tr><th>${esc(k.replace(/_/g, ' '))}</th><td style="white-space:normal">${esc(v)}</td></tr>`).join('') + '</table>';
  $('viewModal').style.display = 'block';
}

// ----- add / edit -----
function openEdit(row) {
  editing = row;
  $('editTitle').textContent = (row ? 'Edit ' : 'Add ') + (view === 'students' ? 'Student' : 'Staff Member');
  $('editFields').innerHTML = FIELDS[view].map(([name, label, type]) => {
    const v = row ? row[name] : (name === 'status' ? 'active' : '');
    let input;
    if (type === 'class') input = `<select name="${name}"><option value="">-</option>` + classes.map((c) => `<option value="${c.id}" ${c.id == v ? 'selected' : ''}>${esc(c.name)}</option>`).join('') + '</select>';
    else if (Array.isArray(type)) input = `<select name="${name}"><option value="">-</option>` + type.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('') + '</select>';
    else input = `<input type="${type || 'text'}" name="${name}" value="${esc(v)}">`;
    return `<div><label>${label}</label>${input}</div>`;
  }).join('');
  $('editMsg').className = 'msg';
  $('editModal').style.display = 'block';
}
$('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api(editing ? 'PUT' : 'POST', `/api/${view}` + (editing ? '/' + editing.id : ''), data);
    $('editModal').style.display = 'none'; refresh();
  } catch (err) { $('editMsg').className = 'msg err'; $('editMsg').textContent = err.message; }
});
$('addBtn').onclick = () => openEdit(null);
$('closeEdit').onclick = () => ($('editModal').style.display = 'none');
$('closeView').onclick = () => ($('viewModal').style.display = 'none');

// ----- tabs & start -----
document.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.tab-btn').forEach((x) => x.classList.toggle('active', x === b));
  view = b.dataset.view; loadList();
}));
let timer; $('search').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(loadList, 250); });
function refresh() { loadStats(); loadList(); }
async function start() {
  try { classes = await api('GET', '/api/classes'); showDash(true); refresh(); } catch (e) { showDash(false); }
}
if (token) start();
