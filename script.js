const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal, .gsap-fade, .gsap-fade-left');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), Number(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealItems.forEach((item) => revealObserver.observe(item));

const counters = document.querySelectorAll('.metric-number');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.counter);
      const suffix = counter.dataset.suffix || '';
      const duration = prefersReduced ? 20 : 1400;
      const start = performance.now();
      const animate = (t) => {
        const progress = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target % 1 !== 0 ? (target * eased).toFixed(1) : Math.round(target * eased);
        counter.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((counter) => counterObserver.observe(counter));

const storySteps = document.querySelectorAll('.story-step');
const label = document.getElementById('story-label');
const progress = document.getElementById('story-progress');
const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const step = entry.target;
      storySteps.forEach((item) => item.classList.remove('active'));
      step.classList.add('active');
      label.textContent = step.dataset.description;
      const idx = [...storySteps].indexOf(step) + 1;
      progress.style.width = `${(idx / storySteps.length) * 100}%`;
    });
  },
  { threshold: 0.5 }
);
storySteps.forEach((step) => storyObserver.observe(step));

if (!prefersReduced) {
  const heroMedia = document.querySelector('.hero-art');
  if (heroMedia) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      heroMedia.style.transform = `translate(${x}px, ${y}px)`;
    });
    document.addEventListener('mouseleave', () => {
      heroMedia.style.transform = 'translate(0, 0)';
    });
  }
}

for (const form of document.querySelectorAll('.cta-form')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const feedback = form.querySelector('.form-feedback');
    feedback.className = 'form-feedback';

    if (!form.checkValidity()) {
      feedback.textContent = 'Please complete all required fields.';
      feedback.classList.add('error');
      form.reportValidity();
      return;
    }

    if (form.action.includes('your-pilot-form-id') || form.action.includes('your-early-access-form-id')) {
      feedback.textContent = 'Formspree is not connected yet. Replace the placeholder form ID in the form action first.';
      feedback.classList.add('error');
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Request failed');
      feedback.textContent = form.dataset.successMessage || 'Thank you. Your request has been received.';
      feedback.classList.add('success');
      form.reset();
    } catch {
      feedback.textContent = 'Unable to submit right now. Please try again shortly.';
      feedback.classList.add('error');
    }
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
