require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const app = express();

// In-memory storage for subscribers
let subscribers = [];

// Enhanced CORS configuration
const allowedOrigins = [
  'https://palpay.space', // Your production frontend
  'http://localhost:3000'  // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// VAPID keys setup
const vapidKeys = {
  publicKey: process.env.BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0,
  privateKey: process.env.EHAUUf_3DaCunW45mgpoudwZ1KXKh_c5GiapUwNH2RU
};

webpush.setVapidDetails(
  'mailto:mehulproofficial@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Routes
app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

app.post('/subscribe', (req, res) => {
  try {
    const { subscription, userAgent } = req.body;
    
    // Remove existing subscription if exists
    subscribers = subscribers.filter(
      sub => sub.subscription.endpoint !== subscription.endpoint
    );
    
    // Add new subscription
    subscribers.push({
      subscription,
      userAgent,
      timestamp: Date.now()
    });
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/subscribers', (req, res) => {
  try {
    res.json({
      count: subscribers.length,
      subscribers: subscribers.map(sub => ({
        userAgent: sub.userAgent,
        timestamp: sub.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/send', async (req, res) => {
  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notificationPayload = {
      title,
      message,
      url: 'https://palpay.space'
    };

    // Send to all subscribers
    const sendResults = await Promise.allSettled(
      subscribers.map(async subscriber => {
        try {
          await webpush.sendNotification(
            subscriber.subscription,
            JSON.stringify(notificationPayload)
          );
          return { status: 'success', endpoint: subscriber.subscription.endpoint };
        } catch (error) {
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            subscribers = subscribers.filter(
              sub => sub.subscription.endpoint !== subscriber.subscription.endpoint
            );
          }
          return { status: 'failed', endpoint: subscriber.subscription.endpoint, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      sent: sendResults.filter(r => r.status === 'success').length,
      failed: sendResults.filter(r => r.status === 'rejected').length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
});