const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const vapidKeys = {
    publicKey: 'BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0',
    privateKey: '0dYr7vXY4czbi1aThdJxAj5n8MPZcV5RXJtP9bJOVXc'
};

webpush.setVapidDetails('mailto:test@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

let subscriptions = [];

app.post('/send-subscription', (req, res) => {
    const sub = req.body;
    subscriptions.push(sub);
    res.status(201).json({ message: 'Subscription saved.' });
});

app.post('/send-notification', (req, res) => {
    const { title, message } = req.body;
    const payload = JSON.stringify({ title, message });

    const results = subscriptions.map(sub => 
        webpush.sendNotification(sub, payload).catch(err => console.error('Push error', err))
    );

    Promise.all(results).then(() => res.json({ success: true }));
});

app.get('/subscribers', (req, res) => {
    const agents = subscriptions.map(s => s.keys?.auth || 'Unknown');
    res.json({ count: subscriptions.length, subscribers: agents });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));