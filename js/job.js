const jobsEndpoint = 'data/jobs.json';

const readLocalJobs = () => {
  try {
    const raw = localStorage.getItem('jobs');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const findJob = async (slug) => {
  try {
    const res = await fetch(jobsEndpoint);
    const data = await res.json();
    const local = readLocalJobs();
    const merged = [...data, ...local];
    return merged.find((j) => (j.slug || j.id) === slug);
  } catch {
    const local = readLocalJobs();
    return local.find((j) => (j.slug || j.id) === slug);
  }
};

const formatSalary = (s) => {
  if (!s) return '';
  if (typeof s.min === 'number' && typeof s.max === 'number') {
    return `${s.currency} ${s.min.toLocaleString()} - ${s.max.toLocaleString()}`;
  }
  return `${s.currency || ''} ${s.min || ''}`.trim();
};

const setMeta = (job) => {
  document.title = `${job.title} | Josmiancare`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', `${job.title} in ${job.department}. ${job.employmentType}.`);
};

const applicationKey = (id) => `applications:${id}`;

const readApplications = (id) => {
  try {
    const raw = localStorage.getItem(applicationKey(id));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveApplication = (id, app) => {
  const existing = readApplications(id);
  const next = [...existing, { ...app, submittedAt: new Date().toISOString() }];
  localStorage.setItem(applicationKey(id), JSON.stringify(next));
};

const renderJob = (job) => {
  const salary = formatSalary(job.salaryRange);
  const quals = (job.qualifications || []).map((q) => `<li class="mb-2"><i class="bi bi-check-circle-fill me-2"></i>${q}</li>`).join('');
  const container = document.getElementById('job-container');
  container.innerHTML = `
    <div class="row">
      <div class="col-lg-8">
        <h2 class="section-title">${job.title}</h2>
        <p class="text-muted">${job.department} • ${job.location} • ${job.employmentType}</p>
        ${salary ? `<p class="fw-bold">${salary}</p>` : ''}
        <p>${job.description || ''}</p>
        <h5 class="mt-4">Required Qualifications</h5>
        <ul class="list-unstyled mt-2">${quals}</ul>
        <div class="mt-4 d-flex gap-3">
          <a href="mailto:careers@josmiancare.com?subject=${encodeURIComponent(job.title)}" class="btn btn-primary">Apply via Email</a>
          <a href="careers.html" class="btn btn-outline-accent">Back to Positions</a>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card p-3">
          <h5 class="mb-3">Submit Application</h5>
          <form id="application-form">
            <div class="mb-3">
              <input type="text" class="form-control" id="app-name" placeholder="Full Name" required />
            </div>
            <div class="mb-3">
              <input type="email" class="form-control" id="app-email" placeholder="Email" required />
            </div>
            <div class="mb-3">
              <input type="url" class="form-control" id="app-resume" placeholder="Resume URL" required />
            </div>
            <div class="mb-3">
              <textarea class="form-control" id="app-notes" rows="3" placeholder="Notes"></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100">Submit</button>
          </form>
          <div id="app-success" class="alert alert-success mt-3 d-none">Application submitted.</div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('application-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('app-name').value.trim();
    const email = document.getElementById('app-email').value.trim();
    const resume = document.getElementById('app-resume').value.trim();
    if (!name || !email || !resume) return;
    saveApplication(job.slug || job.id, { name, email, resume, notes: document.getElementById('app-notes').value.trim() });
    document.getElementById('app-success').classList.remove('d-none');
    form.reset();
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const slug = params.get('id');
  if (!slug) return;
  const job = await findJob(slug);
  if (!job) {
    document.getElementById('job-container').innerHTML = '<div class="alert alert-danger">Job not found.</div>';
    return;
  }
  setMeta(job);
  renderJob(job);
});

