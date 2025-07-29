const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();

// 1. Allowed CORS Origins
const allowedOrigins = [
  'https://palpay.space',
  'https://www.palpay.space',
  'http://localhost:3000'
];

// 2. Middleware: CORS & JSON
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 3. VAPID Keys (from Railway Environment Variables)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('❌ VAPID keys are missing! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Railway.');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:mehulproofficial@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 4. In-memory storage for subscribers
let subscribers = [];

// 5. Routes

// Get public VAPID key
app.get('/vapidPublicKey', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.send(vapidKeys.publicKey);
});

// Subscribe user
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  // Prevent duplicates
  if (!subscribers.find(sub => sub.endpoint === subscription.endpoint)) {
    subscribers.push(subscription);
    console.log('✅ New subscriber added:', subscription.endpoint);
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

// View subscribers (optional for debug)
app.get('/subscribers', (req, res) => {
  res.json({ count: subscribers.length, subscribers });
});

// Send notification to all
app.post('/send', async (req, res) => {
  const { title, body, icon, url } = req.body;

  const payload = JSON.stringify({
    title: title || 'Notification',
    body: body || '',
    icon: icon || '',
    url: url || '/'
  });

  const results = await Promise.allSettled(
    subscribers.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('❌ Failed to send to:', sub.endpoint);
        return { error: true, endpoint: sub.endpoint };
      })
    )
  );

  res.json({
    sent: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});
