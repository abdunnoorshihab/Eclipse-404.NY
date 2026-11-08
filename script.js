(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const form = $('#registrationForm');
  const formStatus = $('#formStatus');
  const submitBtn = form.querySelector('[type="submit"]');
  const sky = $('#sky');
  const ctx = sky.getContext('2d');
  const audio = $('#fireworksAudio');
  const nav = $('nav');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fireworks = [];
  let animationId = null;
  let stopAt = 0;
  let audioStarted = false;

  $('#year').textContent = String(new Date().getFullYear());

  function updateNavState() {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    sky.width = Math.round(window.innerWidth * pixelRatio);
    sky.height = Math.round(window.innerHeight * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function launchFirework(x, y) {
    const shades = [174, 186, 202, 275, 46, 342];
    const hue = shades[Math.floor(Math.random() * shades.length)];
    for (let i = 0; i < 65; i++) {
      const angle = Math.PI * 2 * i / 65;
      const speed = 1.1 + Math.random() * 4;
      fireworks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        limit: 38 + Math.random() * 30,
        radius: 1 + Math.random() * 1.7,
        hue
      });
    }
  }

  function fireworksFrame(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (Math.random() < .16 && time < stopAt - 550) {
      launchFirework(
        window.innerWidth * (.15 + Math.random() * .7),
        window.innerHeight * (.08 + Math.random() * .55)
      );
    }
    fireworks.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += .027;
      particle.vx *= .99;
      particle.life++;
      const alpha = Math.max(0, 1 - particle.life / particle.limit);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${particle.hue}, 95%, 75%, ${alpha})`;
      ctx.shadowBlur = 17;
      ctx.shadowColor = `hsl(${particle.hue}, 100%, 72%)`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    fireworks = fireworks.filter((particle) => particle.life < particle.limit);
    ctx.shadowBlur = 0;

    if (time < stopAt || fireworks.length) {
      animationId = requestAnimationFrame(fireworksFrame);
    } else {
      animationId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function showFireworks() {
    if (prefersReducedMotion || !ctx) return;
    stopAt = performance.now() + 6100;
    for (let i = 0; i < 3; i++) {
      launchFirework(
        window.innerWidth * (.25 + Math.random() * .55),
        window.innerHeight * (.15 + Math.random() * .4)
      );
    }
    if (!animationId) animationId = requestAnimationFrame(fireworksFrame);
  }

  function removeAudioRetryListeners() {
    document.removeEventListener('pointerdown', startAudio);
    document.removeEventListener('keydown', startAudio);
  }

  async function startAudio() {
    if (audioStarted) return;
    try {
      await audio.play();
      audioStarted = true;
      removeAudioRetryListeners();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        document.addEventListener('pointerdown', startAudio, { passive: true });
        document.addEventListener('keydown', startAudio);
      } else if (error.name !== 'AbortError') {
        console.warn('Fireworks audio could not be played:', error);
      }
    }
  }

  showFireworks();
  startAudio();

  function validateProfile(field, value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return false;
      const hostname = url.hostname.toLowerCase();
      if (field === 'facebook') {
        return /(^|\.)facebook\.com$|(^|\.)fb\.com$/.test(hostname) && url.pathname.length > 1;
      }
      return /(^|\.)instagram\.com$/.test(hostname) && url.pathname.length > 1;
    } catch {
      return field === 'instagram' && /^@[A-Za-z0-9._]{1,30}$/.test(value);
    }
  }

  function setMessage(message, isError = false) {
    formStatus.textContent = message;
    formStatus.classList.toggle('error', isError);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    if (!validateProfile('facebook', String(data.facebook).trim())) {
      setMessage('Please enter a valid Facebook profile URL.', true);
      $('#facebook').focus();
      return;
    }
    if (!validateProfile('instagram', String(data.instagram).trim())) {
      setMessage('Please enter a valid Instagram URL or @username.', true);
      $('#instagram').focus();
      return;
    }

    submitBtn.disabled = true;
    $('.submit-label').textContent = 'TRANSMITTING...';
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          facebook: data.facebook,
          instagram: data.instagram,
          consent: Boolean(data.consent),
          website: data.website || ''
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to submit. Please try again.');
      form.reset();
      setMessage('Request received. If selected, we will contact you privately.');
      showFireworks();
    } catch (error) {
      setMessage(error.message || 'Network error. Please try again.', true);
    } finally {
      submitBtn.disabled = false;
      $('.submit-label').textContent = 'REQUEST MY INVITATION';
    }
  });

  const config = window.ECLIPSE_CONFIG || {};
  const messenger = $('#messengerLink');
  const whatsapp = $('#whatsappLink');
  if (/^[a-zA-Z0-9._-]{2,100}$/.test(config.messengerUsername || '')) {
    messenger.href = `https://m.me/${encodeURIComponent(config.messengerUsername)}`;
    messenger.hidden = false;
  }
  if (/^\d{8,16}$/.test(config.whatsappNumber || '')) {
    whatsapp.href = `https://wa.me/${config.whatsappNumber}`;
    whatsapp.hidden = false;
  }
  if (messenger.hidden && whatsapp.hidden) {
    $('#chatDescription').textContent = 'Chat links are not configured yet. Please contact the event team through Facebook.';
  }

  const chatToggle = $('#chatToggle');
  const chatMenu = $('#chatMenu');
  const chatClose = $('#chatClose');
  function setChatOpen(isOpen) {
    chatMenu.hidden = !isOpen;
    chatToggle.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) chatToggle.focus();
  }
  chatToggle.addEventListener('click', () => setChatOpen(chatMenu.hidden));
  chatClose.addEventListener('click', () => setChatOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !chatMenu.hidden) setChatOpen(false);
  });
})();
