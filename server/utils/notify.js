// Stub notification service — logs instead of calling a real WhatsApp/SMS API,
// since that requires paid third-party credentials (Twilio/WhatsApp Business API)
function sendOrderNotification(phone, message) {
  if (!phone) return; // optional per A8 no-login guarantee
  console.log(`[NOTIFY] Would send to ${phone}: "${message}"`);
}

module.exports = { sendOrderNotification };