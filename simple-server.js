const express = require('express');
const path = require('path');
const app = express();
const PORT = 4000;

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist', 'public')}`);
});
