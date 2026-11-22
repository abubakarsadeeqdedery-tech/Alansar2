// Online application forms -> saved in the school database
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
    ['student', 'teacher'].forEach((t) => {
      document.getElementById('tab-' + t).style.display = btn.dataset.tab === t ? 'block' : 'none';
    });
  });
});

document.querySelectorAll('form[data-url]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = form.querySelector('.msg');
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const res = await fetch(form.dataset.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Something went wrong');
      form.reset();
      msg.className = 'msg ok';
      msg.textContent = 'Thank you! Your application has been received. The school will contact you.';
    } catch (err) {
      msg.className = 'msg err';
      msg.textContent = err.message === 'Failed to fetch'
        ? 'Cannot reach the school server. Please try again later.' : err.message;
    }
    btn.disabled = false;
  });
});
