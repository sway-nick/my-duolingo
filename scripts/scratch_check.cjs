const fs = require('fs');
['frontend/services/api.js', 'frontend/services/firebase.js', 'backend/dist/Code.gs'].forEach(f => {
  if (fs.existsSync(f)) {
    const s = fs.readFileSync(f, 'utf8');
    const m = s.match(/https:\/\/[^\s"'`]+/g);
    console.log(f, m ? m.slice(0, 5) : []);
  }
});
