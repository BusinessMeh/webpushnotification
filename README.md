# My Push Notification App

Simple Push Notification app using Node.js and the Web Push API.

## 📦 Setup

```bash
npm install
npm start
```

## 🧪 Test

- User Page: [http://localhost:3000/views/index.html](http://localhost:3000/views/index.html)
- Admin Page: [http://localhost:3000/views/admin.html](http://localhost:3000/views/admin.html)

## 📌 Notes

- Use `ngrok` or reverse proxy to expose for HTTPS in production.
- Service Workers require HTTPS in production.
- Replace the VAPID public key dynamically or inject from `/vapidPublicKey` endpoint.
