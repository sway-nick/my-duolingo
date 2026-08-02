const API_URL =
  'https://script.google.com/macros/s/AKfycby0lLhpcGJOddZ6L64_D5i14zcU1ZdCtkgA3sj1G9w36eelkGPP4M6k2iTZekTGFAHhFg/exec';

async function checkHealth() {
  const response = await fetch(`${API_URL}?route=health`);

  const data = await response.json();

  console.log(data);

  document.querySelector('#status').textContent = data.data.status;
}

checkHealth();
