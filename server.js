
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const vapidKeys = {
  publicKey: 'BCxCPq7jOLla0pa43gQ1QwANoihzOYENM859BM3XFu1hrg5-ubbit0oJ265ZPiPU62mRQ48hGgkjkchj11wVg84',
  privateKey: 'oAzO_KQM4qo9eEIZxZJ9uO_4Zn1RMFBZKHfahkD4BQY'
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
