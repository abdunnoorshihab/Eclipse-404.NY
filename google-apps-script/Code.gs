/**
 * Set SCRIPT_SECRET in Apps Script > Project Settings > Script properties.
 * This must match the REGISTRATION_SECRET environment variable in Vercel.
 * The script must be bound to the Google Sheet used for registrations.
 * Deploy > New deployment > Web app > Execute as Me > Who has access: Anyone.
 * Keep the web app URL and secret private, server side only.
 */
function doPost(e) {
  try {
    var input = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('SCRIPT_SECRET');
    if (!expected || String(input.secret || '') !== expected) {
      return reply_({ ok: false, error: 'unauthorized' });
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Facebook', 'Instagram', 'Consent', 'Status']);
      sheet.setFrozenRows(1);
    }
    if (String(input.name || '').trim().length < 2 || input.consent !== true) {
      return reply_({ ok: false, error: 'invalid' });
    }
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        new Date(), safe_(input.name), safe_(input.phone), safe_(input.email),
        safe_(input.facebook), safe_(input.instagram), 'Yes', 'Pending'
      ]);
    } finally { lock.releaseLock(); }
    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'server_error' });
  }
}
function safe_(value) {
  var text = String(value || '').replace(/[\u0000-\u001F]/g, ' ').slice(0, 500).trim();
  // Defend against spreadsheet formula injection.
  return /^[=+@-]/.test(text) ? "'" + text : text;
}
function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
