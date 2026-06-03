// ── Navbar scroll effect ────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile nav toggle ───────────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav__links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Contact form feedback ───────────────────────────────────────────────────
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = '✅ Message Sent!';
  btn.disabled = true;
  btn.style.opacity = '0.7';
  setTimeout(() => {
    btn.textContent = 'Send Message ✉️';
    btn.disabled = false;
    btn.style.opacity = '';
    form.reset();
  }, 3000);
});

// ── Scroll reveal (Intersection Observer) ──────────────────────────────────
const revealTargets = document.querySelectorAll('.skill__card, .project__card, .about__card, .about__text');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});
