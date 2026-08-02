const API_URL =
  'https://script.google.com/macros/s/AKfycby0lLhpcGJOddZ6L64_D5i14zcU1ZdCtkgA3sj1G9w36eelkGPP4M6k2iTZekTGFAHhFg/exec';

async function getHealth() {
  const response = await fetch(`${API_URL}?route=health`);

  return response.json();
}

async function getWords() {
  const response = await fetch(`${API_URL}?route=words`);

  return response.json();
}

export { getHealth, getWords };
