const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

let vapidKeys;
const keysPath = './vapid-keys.json';
if (fs.existsSync(keysPath)) {
  vapidKeys = JSON.parse(fs.readFileSync(keysPath));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(keysPath, JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/scripts', express.static(path.join(__dirname, 'src/scripts')));
app.use('/views', express.static(path.join(__dirname, 'src/views')));

app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

let subscriptions = [];
const subsPath = './subscriptions.json';
if (fs.existsSync(subsPath)) {
  subscriptions = JSON.parse(fs.readFileSync(subsPath));
}

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  fs.writeFileSync(subsPath, JSON.stringify(subscriptions));
  res.status(201).json({});
});

app.post('/notify', (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title,
    body: req.body.body
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });

  res.status(200).json({ message: 'Notifications sent' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Access User:   http://localhost:${port}/views/index.html`);
  console.log(`Access Admin:  http://localhost:${port}/views/admin.html`);
});