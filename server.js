
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const vapidKeys = {
  publicKey: 'YOUR_PUBLIC_KEY_HERE',
  privateKey: 'YOUR_PRIVATE_KEY_HERE'
};

webpush.setVapidDetails('mailto:admin@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

let subscribers = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscribers.push(subscription);
  res.status(201).json({ message: 'Subscribed successfully.' });
});

app.post('/sendNotification', (req, res) => {
  const { title, body, image, url, icon } = req.body;
  const payload = JSON.stringify({ title, body, image, url, icon });

  Promise.all(subscribers.map(sub => webpush.sendNotification(sub, payload)))
    .then(() => res.status(200).json({ message: 'Notifications sent.' }))
    .catch(err => {
      console.error('Notification error:', err);
      res.sendStatus(500);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
