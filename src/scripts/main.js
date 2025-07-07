let publicVapidKey = '';
fetch('/vapidPublicKey').then(res => res.text()).then(key => {
  publicVapidKey = key;
});

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js').then(swReg => {
    document.getElementById('subscribe').addEventListener('click', () => {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          }).then(subscription => {
            fetch('/subscribe', {
              method: 'POST',
              body: JSON.stringify(subscription),
              headers: {
                'Content-Type': 'application/json'
              }
            });
          });
        }
      });
    });
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}