const axios = require('axios');

/**
 * Best-effort order notifications. Every branch here is optional and
 * silently skipped if not configured — a notification failure must never
 * block an order from being created.
 */
const notifyNewOrder = async (order) => {
  const itemsSummary = order.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
  const deliveryLine =
    order.deliveryMethod === 'delivery'
      ? `Delivery to: ${order.deliveryAddress?.fullAddress || 'location pinned on map'}`
      : 'Customer will pick up in-store';

  // --- Telegram ---
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text =
      `🛍️ NEW ORDER #${order.orderNumber}\n` +
      `👤 ${order.customer.name} — ${order.customer.phone}\n` +
      `📦 ${itemsSummary}\n` +
      `💰 ETB ${order.total} (${order.paymentMethod.toUpperCase()})\n` +
      `📍 ${deliveryLine}`;
    try {
      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        { chat_id: process.env.TELEGRAM_CHAT_ID, text }
      );
    } catch (err) {
      console.warn('[notify] Telegram notification failed:', err.message);
    }
  }

  // --- Email ---
  if (process.env.SMTP_HOST && process.env.ADMIN_NOTIFY_EMAIL) {
    try {
      // eslint-disable-next-line global-require
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'no-reply@kalluxurywigshop.com',
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `New order #${order.orderNumber} — ETB ${order.total}`,
        text: `${itemsSummary}\n${deliveryLine}\nCustomer: ${order.customer.name} (${order.customer.phone})`,
      });
    } catch (err) {
      console.warn('[notify] Email notification failed:', err.message);
    }
  }
};

module.exports = { notifyNewOrder };
