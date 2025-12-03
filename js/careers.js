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

const isExpired = (job) => {
  if (!job.applicationDeadline) return false;
  const now = new Date();
  const deadline = new Date(job.applicationDeadline);
  return deadline < now;
};

const fetchJobs = async () => {
  try {
    const res = await fetch(jobsEndpoint);
    const data = await res.json();
    const local = readLocalJobs();
    const merged = [...data, ...local];
    return merged.filter((j) => j.isActive && !isExpired(j));
  } catch {
    return readLocalJobs().filter((j) => j.isActive && !isExpired(j));
  }
};

const excerpt = (text, n = 120) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n) + '…' : clean;
};

const formatSalary = (s) => {
  if (!s) return '';
  if (typeof s.min === 'number' && typeof s.max === 'number') {
    return `${s.currency} ${s.min.toLocaleString()} - ${s.max.toLocaleString()}`;
  }
  return `${s.currency || ''} ${s.min || ''}`.trim();
};

const jobCardHtml = (job) => {
  const locationLabel = job.location === 'office' ? 'Office' : job.location.charAt(0).toUpperCase() + job.location.slice(1);
  const typeLabel = job.employmentType.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('-');
  return `
    <div class="col-md-6 col-lg-4">
      <div class="job-card h-100 p-4 rounded-3">
        <h4 class="job-title mb-3">${job.title}</h4>
        <div class="d-flex gap-4 mb-3">
          <span class="small"><i class="bi bi-briefcase me-2"></i>${typeLabel}</span>
          <span class="small"><i class="bi bi-geo-alt me-2"></i>${locationLabel}</span>
          <span class="small"><i class="bi bi-people me-2"></i>${job.department}</span>
        </div>
        <p class="text-muted">${excerpt(job.description, 140)}</p>
        <a href="job.html?id=${encodeURIComponent(job.slug || job.id)}" class="fw-bold">Apply Now <i class="bi bi-arrow-right"></i></a>
      </div>
    </div>
  `;
};

const renderJobs = (jobs) => {
  const container = document.getElementById('job-list');
  if (!jobs.length) {
    container.innerHTML = '<div class="col-12"><div class="alert alert-warning">No open positions at this time.</div></div>';
    return;
  }
  container.innerHTML = jobs.map(jobCardHtml).join('');
};

document.addEventListener('DOMContentLoaded', async () => {
  const jobs = await fetchJobs();
  renderJobs(jobs);
});
