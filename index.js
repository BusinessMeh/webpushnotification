const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_KEYS = {
  publicKey: 'BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0',
  privateKey: '0dYr7vXY4czbi1aThdJxAj5n8MPZcV5RXJtP9bJOVXc'
};

webpush.setVapidDetails(
  'mailto:mehulproofficial@gmail.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

let subscriptions = [];
let userAgents = [];

app.post('/send-subscription', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  const ua = req.headers['user-agent'];
  if (!userAgents.includes(ua)) userAgents.push(ua);
  res.status(201).json({ message: 'Subscription stored' });
});

app.post('/send-notification', async (req, res) => {
  const payload = JSON.stringify({ message: req.body.message });
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  res.json({ status: 'Sent', results });
});

app.get('/subscribers', (req, res) => {
  res.json({ count: userAgents.length, devices: userAgents });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
