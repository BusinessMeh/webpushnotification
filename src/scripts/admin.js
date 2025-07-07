document.getElementById('send').addEventListener('click', () => {
  const title = document.getElementById('title').value;
  const body = document.getElementById('body').value;
  fetch('/notify', {
    method: 'POST',
    body: JSON.stringify({ title, body }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
});