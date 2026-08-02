const API_URL =
  'https://script.google.com/macros/s/AKfycbxygtzp1X2RThCt7hN-0_CXh1uR_J7HDWG3sC5zeJZdFltXp395tAlpYuMlHh9SKuIpLw/exec';

async function checkHealth() {
  const response = await fetch(`${API_URL}?route=health`);

  const data = await response.json();

  console.log(data);

  document.querySelector('#status').textContent = data.data.status;
}

checkHealth();
