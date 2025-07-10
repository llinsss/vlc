const API_BASE = 'http://localhost:4000/api';

export async function getStatus() {
  const res = await fetch(`${API_BASE}/playback/status`);
  return res.json();
}

export async function play() {
  await fetch(`${API_BASE}/playback/play`, { method: 'POST' });
}

export async function pause() {
  await fetch(`${API_BASE}/playback/pause`, { method: 'POST' });
}

export async function stop() {
  await fetch(`${API_BASE}/playback/stop`, { method: 'POST' });
}

export async function next() {
  await fetch(`${API_BASE}/playback/next`, { method: 'POST' });
}

export async function previous() {
  await fetch(`${API_BASE}/playback/previous`, { method: 'POST' });
}

export async function playFile(uri) {
  await fetch(`${API_BASE}/playback/playfile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uri })
  });
}

export async function enqueueFile(uri) {
  await fetch(`${API_BASE}/playback/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uri })
  });
}

export async function getWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`);
  return res.json();
}

export async function addToWatchlist(title, uri) {
  await fetch(`${API_BASE}/watchlist/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, uri })
  });
}

export async function getSuggestions() {
  const res = await fetch(`${API_BASE}/suggestions`);
  return res.json();
}

export async function fetchSubtitles(title, language = 'en') {
  const res = await fetch(`${API_BASE}/subtitles/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, language })
  });
  return res.json();
} 