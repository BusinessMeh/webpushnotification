const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();

// Enable CORS for your Hostinger domain
app.use(cors({ origin: 'https://palpay.space' }));
app.use(express.json());

// VAPID Keys (set in Railway Variables)
const vapidKeys = {
  publicKey: process.env.BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0,
  privateKey: process.env.EHAUUf_3DaCunW45mgpoudwZ1KXKh_c5GiapUwNH2RU
};

webpush.setVapidDetails(
  'mailto:mehulproofficial@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory storage
let subscribers = [];

// Routes
app.post('/subscribe', (req, res) => {
  const { subscription, userAgent } = req.body;
  subscribers.push({ subscription, userAgent, timestamp: Date.now() });
  res.status(201).send('Subscribed!');
});

app.get('/subscribers', (req, res) => {
  res.json({ count: subscribers.length, subscribers });
});

app.post('/send', (req, res) => {
  const { title, message } = req.body;
  subscribers.forEach(sub => {
    webpush.sendNotification(sub.subscription, JSON.stringify({ title, message }))
      .catch(err => console.error('Push failed:', err));
  });
  res.send('Notifications sent!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));