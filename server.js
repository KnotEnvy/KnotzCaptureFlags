const express = require('express');
const app = express();
const port = 3000;
  // browser-sync config
const browserSync = require('browser-sync').create();

// Serve static files from the "public" directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Game server running at http://localhost:${port}/`);

});

