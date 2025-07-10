const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;

app.use(express.json());

// mediaInk HTTP API base URL
const MEDIAINK_BASE = 'http://localhost:8080/requests';

// Helper to call mediaInk HTTP API
async function mediaInkGet(path, params = {}) {
  try {
    const res = await axios.get(`${MEDIAINK_BASE}${path}`, { params });
    return res.data;
  } catch (err) {
    throw err.response ? err.response.data : err;
  }
}

// Get mediaInk status
app.get('/api/playback/status', async (req, res) => {
  try {
    const status = await mediaInkGet('/status.json');
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get mediaInk status', details: err });
  }
});

// Play (resume or play current)
app.post('/api/playback/play', async (req, res) => {
  try {
    await mediaInkGet('/status.json', { command: 'pl_play' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to play', details: err });
  }
});

// Pause
app.post('/api/playback/pause', async (req, res) => {
  try {
    await mediaInkGet('/status.json', { command: 'pl_pause' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pause', details: err });
  }
});

// Stop
app.post('/api/playback/stop', async (req, res) => {
  try {
    await mediaInkGet('/status.json', { command: 'pl_stop' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to stop', details: err });
  }
});

// Next
app.post('/api/playback/next', async (req, res) => {
  try {
    await mediaInkGet('/status.json', { command: 'pl_next' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to go to next', details: err });
  }
});

// Previous
app.post('/api/playback/previous', async (req, res) => {
  try {
    await mediaInkGet('/status.json', { command: 'pl_previous' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to go to previous', details: err });
  }
});

// Add to playlist and play
app.post('/api/playback/playfile', async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).json({ error: 'Missing uri' });
  try {
    await mediaInkGet('/status.json', { command: 'in_play', input: uri });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to play file', details: err });
  }
});

// Add to playlist (enqueue)
app.post('/api/playback/enqueue', async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).json({ error: 'Missing uri' });
  try {
    await mediaInkGet('/status.json', { command: 'in_enqueue', input: uri });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enqueue file', details: err });
  }
});

// Watchlist: store played movies in a local JSON file
const fs = require('fs');
const WATCHLIST_FILE = 'watchlist.json';

function loadWatchlist() {
  try {
    return JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveWatchlist(list) {
  fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(list, null, 2));
}

// Add to watchlist (called after playback starts)
app.post('/api/watchlist/add', (req, res) => {
  const { title, uri } = req.body;
  if (!title || !uri) return res.status(400).json({ error: 'Missing title or uri' });
  const list = loadWatchlist();
  if (!list.find(item => item.uri === uri)) {
    list.push({ title, uri, watchedAt: new Date().toISOString() });
    saveWatchlist(list);
  }
  res.json({ success: true });
});

// Get watchlist
app.get('/api/watchlist', (req, res) => {
  res.json(loadWatchlist());
});

// Placeholder for subtitle generation/fetching
app.post('/api/subtitles/generate', async (req, res) => {
  // To be implemented: generate subtitles from audio or fetch from an API
  res.status(501).json({ error: 'Subtitle generation not implemented yet' });
});

// TMDB integration for movie suggestions
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_LANG = 'en-US';

async function tmdbSearchMovie(title) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not set');
  const res = await axios.get(`${TMDB_BASE}/search/movie`, {
    params: { api_key: TMDB_API_KEY, query: title, language: TMDB_LANG }
  });
  return res.data.results && res.data.results.length > 0 ? res.data.results[0] : null;
}

async function tmdbGetRecommendations(movieId) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not set');
  const res = await axios.get(`${TMDB_BASE}/movie/${movieId}/recommendations`, {
    params: { api_key: TMDB_API_KEY, language: TMDB_LANG }
  });
  return res.data.results || [];
}

// Suggestions endpoint
app.get('/api/suggestions', async (req, res) => {
  try {
    const watchlist = loadWatchlist();
    const seenIds = new Set();
    const suggestions = [];
    for (const item of watchlist) {
      const movie = await tmdbSearchMovie(item.title);
      if (movie && movie.id) {
        const recs = await tmdbGetRecommendations(movie.id);
        for (const rec of recs) {
          if (!seenIds.has(rec.id)) {
            seenIds.add(rec.id);
            suggestions.push({
              id: rec.id,
              title: rec.title,
              overview: rec.overview,
              poster: rec.poster_path ? `https://image.tmdb.org/t/p/w200${rec.poster_path}` : null,
              release_date: rec.release_date
            });
          }
        }
      }
    }
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions', details: err.message || err });
  }
});

// OpenSubtitles integration for subtitle fetching
const OPENSUBTITLES_API_KEY = process.env.OPENSUBTITLES_API_KEY;
const OPENSUBTITLES_BASE = 'https://api.opensubtitles.com/api/v1';

async function fetchOpenSubtitles(title, language = 'en') {
  if (!OPENSUBTITLES_API_KEY) throw new Error('OPENSUBTITLES_API_KEY not set');
  const res = await axios.get(`${OPENSUBTITLES_BASE}/subtitles`, {
    params: { query: title, languages: language },
    headers: { 'Api-Key': OPENSUBTITLES_API_KEY }
  });
  return res.data.data.map(sub => ({
    id: sub.id,
    filename: sub.attributes.files[0]?.file_name,
    language: sub.attributes.language,
    download: sub.attributes.url,
    release: sub.attributes.release,
    uploader: sub.attributes.uploader?.name,
    hearing_impaired: sub.attributes.hearing_impaired,
    fps: sub.attributes.fps,
    votes: sub.attributes.votes,
    downloads: sub.attributes.download_count
  }));
}

// Fetch subtitles endpoint
app.post('/api/subtitles/fetch', async (req, res) => {
  const { title, language } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });
  try {
    const subs = await fetchOpenSubtitles(title, language);
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subtitles', details: err.message || err });
  }
});

app.listen(port, () => {
  console.log(`mediaInk Backend API listening at http://localhost:${port}`);
}); 