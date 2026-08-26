// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const overlay = document.querySelector('.nav-overlay');
  if (!burger || !overlay) return;

  const open = () => {
    burger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    burger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
});
