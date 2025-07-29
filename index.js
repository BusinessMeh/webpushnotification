require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const app = express();

// In-memory storage
let subscribers = [];

// 1. STRICT CORS CONFIGURATION
const allowedOrigins = [
  'https://palpay.space',
  'https://www.palpay.space',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// 2. MIDDLEWARE ORDER MATTERS!
app.options('*', cors(corsOptions)); // Enable preflight for ALL routes
app.use(cors(corsOptions));
app.use(express.json());

// 3. VAPID KEYS SETUP
const vapidKeys = {
  publicKey: process.env.BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0,
  privateKey: process.env.EHAUUf_3DaCunW45mgpoudwZ1KXKh_c5GiapUwNH2RU
};

webpush.setVapidDetails(
  'mailto:mehulproofficial@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 4. EXPLICIT PREFLIGHT HANDLER
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', allowedOrigins.join(', '));
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  next();
});

// 5. ROUTES WITH EXPLICIT HEADERS
app.get('/vapidPublicKey', (req, res) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  res.send(vapidKeys.publicKey);
});

app.post('/subscribe', (req, res) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  // ... rest of your subscribe logic
});

app.get('/subscribers', (req, res) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  // ... rest of your subscribers logic
});

app.post('/send', (req, res) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  // ... rest of your send logic
});

// 6. HEALTH CHECK
app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(200).send('OK');
});

// 7. ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});