const jobsEndpoint = 'data/jobs.json';
const storageKey = 'jobs';
const authKey = 'admin:auth';

const readLocal = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (jobs) => {
  localStorage.setItem(storageKey, JSON.stringify(jobs));
};

const fetchSeed = async () => {
  try {
    const res = await fetch(jobsEndpoint);
    return await res.json();
  } catch {
    return [];
  }
};

const mergedJobs = async () => {
  const seed = await fetchSeed();
  const local = readLocal();
  const ids = new Set(local.map((j) => j.id || j.slug));
  const merged = [...local, ...seed.filter((s) => !ids.has(s.id || s.slug))];
  return merged;
};

const isAuthed = () => localStorage.getItem(authKey) === '1';
const setAuthed = (v) => localStorage.setItem(authKey, v ? '1' : '0');

const randId = (title) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;

const readForm = () => {
  return {
    id: document.getElementById('job-id').value || undefined,
    title: document.getElementById('job-title').value.trim(),
    department: document.getElementById('job-dept').value.trim(),
    location: document.getElementById('job-location').value,
    employmentType: document.getElementById('job-type').value,
    applicationDeadline: document.getElementById('job-deadline').value,
    salaryRange: {
      min: Number(document.getElementById('salary-min').value) || undefined,
      max: Number(document.getElementById('salary-max').value) || undefined,
      currency: document.getElementById('salary-currency').value.trim() || undefined,
    },
    description: document.getElementById('job-desc').value.trim(),
    qualifications: document.getElementById('job-quals').value.split('\n').map((s) => s.trim()).filter(Boolean),
    applicationInstructions: document.getElementById('job-instructions').value.trim(),
    isActive: document.getElementById('job-active').checked,
  };
};

const validate = (job) => {
  if (!job.title || !job.department || !job.location || !job.employmentType || !job.applicationDeadline || !job.description || !job.qualifications?.length) return false;
  return true;
};

const resetForm = () => {
  document.getElementById('job-form').reset();
  document.getElementById('job-id').value = '';
  document.getElementById('form-error').classList.add('d-none');
  document.getElementById('form-success').classList.add('d-none');
};

const renderTable = (jobs) => {
  const el = document.getElementById('jobs-table');
  if (!jobs.length) {
    el.innerHTML = '<div class="alert alert-warning">No jobs found.</div>';
    return;
  }
  const rows = jobs.map((j, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${j.title}</td>
      <td>${j.department}</td>
      <td>${j.location}</td>
      <td>${j.employmentType}</td>
      <td>${j.applicationDeadline || ''}</td>
      <td>${j.isActive ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn btn-sm btn-outline-accent" data-action="edit" data-id="${j.id || j.slug}">Edit</button>
        <button class="btn btn-sm btn-outline-accent" data-action="delete" data-id="${j.id || j.slug}">Delete</button>
      </td>
    </tr>
  `).join('');
  el.innerHTML = `
    <table class="table table-striped">
      <thead><tr><th>#</th><th>Title</th><th>Department</th><th>Location</th><th>Type</th><th>Deadline</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  el.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => handleRowAction(e, jobs));
  });
};

const handleRowAction = (e, jobs) => {
  const action = e.currentTarget.getAttribute('data-action');
  const id = e.currentTarget.getAttribute('data-id');
  if (action === 'edit') {
    const job = jobs.find((j) => (j.id || j.slug) === id);
    if (!job) return;
    document.getElementById('job-id').value = job.id || job.slug || '';
    document.getElementById('job-title').value = job.title || '';
    document.getElementById('job-dept').value = job.department || '';
    document.getElementById('job-location').value = job.location || '';
    document.getElementById('job-type').value = job.employmentType || '';
    document.getElementById('job-deadline').value = job.applicationDeadline || '';
    document.getElementById('salary-min').value = job.salaryRange?.min ?? '';
    document.getElementById('salary-max').value = job.salaryRange?.max ?? '';
    document.getElementById('salary-currency').value = job.salaryRange?.currency ?? '';
    document.getElementById('job-desc').value = job.description || '';
    document.getElementById('job-quals').value = (job.qualifications || []).join('\n');
    document.getElementById('job-instructions').value = job.applicationInstructions || '';
    document.getElementById('job-active').checked = !!job.isActive;
  }
  if (action === 'delete') {
    const local = readLocal().filter((j) => (j.id || j.slug) !== id);
    writeLocal(local);
    refresh();
  }
};

const upsertJob = (job) => {
  const local = readLocal();
  let id = job.id;
  if (!id) id = randId(job.title);
  const slug = job.slug || id;
  const next = { ...job, id, slug, createdAt: new Date().toISOString() };
  const idx = local.findIndex((j) => (j.id || j.slug) === id);
  if (idx >= 0) local[idx] = next; else local.push(next);
  writeLocal(local);
};

const refresh = async () => {
  const jobs = await mergedJobs();
  renderTable(jobs);
};

const exportJson = async () => {
  const jobs = await mergedJobs();
  const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jobs-export.json';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};

const importJson = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) writeLocal(data);
      refresh();
    } catch {}
  };
  reader.readAsText(file);
};

document.addEventListener('DOMContentLoaded', async () => {
  const authBlock = document.getElementById('auth-block');
  const panel = document.getElementById('admin-panel');
  if (isAuthed()) {
    authBlock.classList.add('d-none');
    panel.classList.remove('d-none');
    refresh();
  }
  document.getElementById('login-btn').addEventListener('click', () => {
    const pass = document.getElementById('admin-password').value;
    if (pass && pass.length >= 6) {
      setAuthed(true);
      authBlock.classList.add('d-none');
      panel.classList.remove('d-none');
      refresh();
    } else {
      document.getElementById('auth-error').classList.remove('d-none');
    }
  });

  document.getElementById('job-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const job = readForm();
    if (!validate(job)) {
      document.getElementById('form-error').classList.remove('d-none');
      return;
    }
    upsertJob(job);
    document.getElementById('form-error').classList.add('d-none');
    document.getElementById('form-success').classList.remove('d-none');
    resetForm();
    refresh();
  });
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('export-btn').addEventListener('click', exportJson);
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files?.[0]) importJson(e.target.files[0]);
  });
});

