require('dotenv').config(); // Add this at the top
const express = require('express');
const webpush = require('web-push');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['https://your-hostinger-domain.com'] // Replace with your frontend domain
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for subscribers
let subscribers = [];

// VAPID keys - now using environment variables
const vapidKeys = {
  publicKey: process.env.BArsxo2a3tdrdpCi3p-GJGp7seNNXnxjRb9h06GgyyxJaxe3xvoQXnpmBbL9cASK_W0gcI2FQIfEo6ET6j7VMO0,
  privateKey: process.env.EHAUUf_3DaCunW45mgpoudwZ1KXKh_c5GiapUwNH2RU
};

// Validate VAPID keys
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
  process.exit(1);
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:mehulproofficial@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Routes (same as before, but with Railway-specific optimizations)
// ... [keep all your existing routes] ...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
});