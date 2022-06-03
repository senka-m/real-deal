const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const spaces = JSON.parse(fs.readFileSync('spaces.json'));

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/landing.html'));
});

app.get('/space', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/space.html'));
});

app.get('/closure', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/closure.html'));
});

app.get('/api', (req, res) => {
  const space = spaces.find(space => space.id == req.query.id);

  if (space) {
    res.json(space);
  } else {
    res.sendStatus(404);
  }
});
 
app.listen(port, () => {
  console.log(`Server live at ${port}`);
});