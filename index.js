
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const subscribersFile = path.join(__dirname, 'subscribers.json');

// Generate your VAPID keys once using webpush.generateVAPIDKeys()
const publicVapidKey = '<YOUR_PUBLIC_KEY>';
const privateVapidKey = '<YOUR_PRIVATE_KEY>';

webpush.setVapidDetails(
  'mailto:test@example.com',
  publicVapidKey,
  privateVapidKey
);

function loadSubscribers() {
  if (!fs.existsSync(subscribersFile)) return [];
  return JSON.parse(fs.readFileSync(subscribersFile, 'utf8') || '[]');
}

function saveSubscribers(subscribers) {
  fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
}

app.get('/vapidPublicKey', (req, res) => {
  res.send(publicVapidKey);
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body.subscription;
  const device = req.body.device || 'unknown';
  const time = new Date().toISOString();

  let subscribers = loadSubscribers();
  const exists = subscribers.some(sub => sub.endpoint === subscription.endpoint);

  if (!exists) {
    subscribers.push({ ...subscription, device, time });
    saveSubscribers(subscribers);
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

app.get('/subscribers', (req, res) => {
  const subscribers = loadSubscribers();
  res.json({ count: subscribers.length, subscribers });
});

app.post('/send', (req, res) => {
  const { title, message, image, link, endpoints } = req.body;
  const subscribers = loadSubscribers();
  const targets = subscribers.filter(sub => endpoints.includes(sub.endpoint));

  const payload = JSON.stringify({ title, message, image, link });

  Promise.all(
    targets.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => console.error(err))
    )
  )
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
