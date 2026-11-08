'use strict';

// Serverless Vercel function. It forwards valid registrations to a private
// Google Apps Script webhook. The webhook secret stays on the server only.
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  if (!process.env.REGISTRATION_HOOK_URL || !process.env.REGISTRATION_SECRET) {
    return res.status(503).json({ message: 'Registration is not configured yet. Please contact the organizer.' });
  }
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (Buffer.byteLength(raw, 'utf8') > 12000) return res.status(413).json({ message: 'Request is too large.' });
    const data = JSON.parse(raw);
    // A honeypot field stops the simplest bots without collecting submissions.
    if (data.website) return res.status(200).json({ ok: true });
    const name = String(data.name || '').trim().slice(0, 120);
    const phone = String(data.phone || '').trim().slice(0, 32);
    const email = String(data.email || '').trim().slice(0, 254);
    const facebook = String(data.facebook || '').trim().slice(0, 500);
    const instagram = String(data.instagram || '').trim().slice(0, 500);
    if (name.length < 2 || !/^[+()\d\s-]{7,32}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || data.consent !== true || !isProfileUrl(facebook, ['facebook.com', 'fb.com'])
        || !(isProfileUrl(instagram, ['instagram.com']) || /^@[A-Za-z0-9._]{1,30}$/.test(instagram))) {
      return res.status(400).json({ message: 'Please check all required fields, profile URLs, and consent.' });
    }
    const webhookUrl = new URL(process.env.REGISTRATION_HOOK_URL);
    if (webhookUrl.protocol !== 'https:' || !['script.google.com', 'script.googleusercontent.com'].includes(webhookUrl.hostname)) {
      return res.status(500).json({ message: 'Registration endpoint misconfigured.' });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 13000);
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret: process.env.REGISTRATION_SECRET, name, phone, email, facebook, instagram, consent: true }),
        signal: controller.signal,
        redirect: 'follow'
      });
    } finally { clearTimeout(timeout); }
    const responseText = await response.text();
    let result;
    try { result = JSON.parse(responseText); } catch { result = null; }
    if (!response.ok || !result || result.ok !== true) {
      console.error('Registration webhook rejected request:', response.status);
      return res.status(502).json({ message: 'We could not register your request. Please try again later.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Registration failed:', error.name || 'Error');
    return res.status(502).json({ message: 'Registration is temporarily unavailable. Please try again later.' });
  }
};

function isProfileUrl(input, allowedHosts) {
  try {
    const u = new URL(input);
    return u.protocol === 'https:' && allowedHosts.some(host => u.hostname === host || u.hostname.endsWith('.' + host)) && u.pathname.length > 1;
  } catch { return false; }
}
