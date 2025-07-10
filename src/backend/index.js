const express = require('express');
const app = express();
const port = 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('VLC Backend API is running');
});

// Placeholder endpoints
app.get('/api/playback', (req, res) => res.json({ status: 'ok', message: 'Playback endpoint' }));
app.get('/api/watchlist', (req, res) => res.json({ status: 'ok', message: 'Watchlist endpoint' }));
app.get('/api/subtitles', (req, res) => res.json({ status: 'ok', message: 'Subtitles endpoint' }));
app.get('/api/suggestions', (req, res) => res.json({ status: 'ok', message: 'Suggestions endpoint' }));

app.listen(port, () => {
  console.log(`VLC Backend API listening at http://localhost:${port}`);
}); 