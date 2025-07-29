const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace with your actual frontend URLs
const allowedOrigins = [
  'https://palpay.space',
  'https://www.palpay.space',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins
}));
app.use(bodyParser.json());

// 🔐 Set your VAPID keys in Railway environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment.");
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:support@palpay.space',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// 🧠 In-memory store (no DB)
let subscriptions = [];

app.get('/', (req, res) => {
  res.send('✅ Push Notification Backend is running');
});

// 📩 Receive new subscriber
app.post('/subscribe', (req, res) => {
  const sub = req.body;
  const exists = subscriptions.find(s => JSON.stringify(s) === JSON.stringify(sub));
  if (!exists) {
    subscriptions.push(sub);
  }
  res.status(201).json({ message: 'Subscription added' });
});

// 📊 Get subscriber count
app.get('/subscribers', (req, res) => {
  res.json({ count: subscriptions.length });
});

// 📤 Send notification to all
app.post('/send', async (req, res) => {
  const { title, body, icon, url } = req.body;

  const payload = JSON.stringify({
    title,
    body,
    icon,
    url
  });

  let sent = 0;
  for (let sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      console.error("❌ Failed to send to one subscription:", err.message);
    }
  }

  res.json({ success: true, sent, total: subscriptions.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});
