const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();


const allowedOrigins = [
  'https://palpay.space',
  'https://www.palpay.space',
  'http://localhost:3000'
];


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


let subscribers = [];



app.get('/vapidPublicKey', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.send(vapidKeys.publicKey);
});


app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }


  if (!subscribers.find(sub => sub.endpoint === subscription.endpoint)) {
    subscribers.push(subscription);
    console.log('✅ New subscriber added:', subscription.endpoint);
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});


app.get('/subscribers', (req, res) => {
  res.json({ count: subscribers.length, subscribers });
});


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


app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});
