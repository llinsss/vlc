import React, { useEffect, useState } from 'react';
import * as api from './api';

function App() {
  const [status, setStatus] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [uri, setUri] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [subtitleTitle, setSubtitleTitle] = useState('');
  const [subtitleLang, setSubtitleLang] = useState('en');
  const [subtitles, setSubtitles] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  const fetchStatus = async () => {
    try {
      setStatus(await api.getStatus());
    } catch {
      setStatus(null);
    }
  };

  const fetchWatchlist = async () => {
    setWatchlist(await api.getWatchlist());
  };

  const fetchSuggestions = async () => {
    setSuggestions(await api.getSuggestions());
  };

  useEffect(() => {
    fetchStatus();
    fetchWatchlist();
    fetchSuggestions();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [watchlist]);

  const handlePlay = async () => {
    setLoading(true);
    await api.play();
    setLoading(false);
    fetchStatus();
  };
  const handlePause = async () => {
    setLoading(true);
    await api.pause();
    setLoading(false);
    fetchStatus();
  };
  const handleStop = async () => {
    setLoading(true);
    await api.stop();
    setLoading(false);
    fetchStatus();
  };
  const handleNext = async () => {
    setLoading(true);
    await api.next();
    setLoading(false);
    fetchStatus();
  };
  const handlePrevious = async () => {
    setLoading(true);
    await api.previous();
    setLoading(false);
    fetchStatus();
  };
  const handlePlayFile = async (e) => {
    e.preventDefault();
    if (!uri) return;
    setLoading(true);
    await api.playFile(uri);
    if (title) await api.addToWatchlist(title, uri);
    setLoading(false);
    fetchStatus();
    fetchWatchlist();
  };
  const handleEnqueueFile = async (e) => {
    e.preventDefault();
    if (!uri) return;
    setLoading(true);
    await api.enqueueFile(uri);
    if (title) await api.addToWatchlist(title, uri);
    setLoading(false);
    fetchStatus();
    fetchWatchlist();
  };

  const handleFetchSubtitles = async (e) => {
    e.preventDefault();
    setSubLoading(true);
    setSubError('');
    setSubtitles([]);
    try {
      const subs = await api.fetchSubtitles(subtitleTitle, subtitleLang);
      setSubtitles(subs);
      if (subs.length === 0) setSubError('No subtitles found.');
    } catch (err) {
      setSubError('Failed to fetch subtitles.');
    }
    setSubLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>mediaInk Web/Desktop App</h1>
      <section style={{ marginBottom: 30 }}>
        <h2>Playback Controls</h2>
        <button onClick={handlePlay} disabled={loading}>Play</button>
        <button onClick={handlePause} disabled={loading}>Pause</button>
        <button onClick={handleStop} disabled={loading}>Stop</button>
        <button onClick={handlePrevious} disabled={loading}>Previous</button>
        <button onClick={handleNext} disabled={loading}>Next</button>
        <div style={{ marginTop: 10 }}>
          <strong>Status:</strong> {status ? status.state : 'N/A'}<br />
          <strong>Now Playing:</strong> {status && status.information && status.information.category && status.information.category.meta ? status.information.category.meta.filename : 'N/A'}
        </div>
      </section>
      <section style={{ marginBottom: 30 }}>
        <h2>Play or Enqueue a File</h2>
        <form>
          <input
            type="text"
            placeholder="File URI or path"
            value={uri}
            onChange={e => setUri(e.target.value)}
            style={{ width: 300 }}
          />
          <input
            type="text"
            placeholder="Title (for watchlist)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: 200, marginLeft: 10 }}
          />
          <button onClick={handlePlayFile} disabled={loading} style={{ marginLeft: 10 }}>Play</button>
          <button onClick={handleEnqueueFile} disabled={loading} style={{ marginLeft: 5 }}>Enqueue</button>
        </form>
      </section>
      <section style={{ marginBottom: 30 }}>
        <h2>Subtitle Generation / Fetching</h2>
        <form onSubmit={handleFetchSubtitles} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Movie title"
            value={subtitleTitle}
            onChange={e => setSubtitleTitle(e.target.value)}
            style={{ width: 200 }}
          />
          <input
            type="text"
            placeholder="Language (e.g. en, fr)"
            value={subtitleLang}
            onChange={e => setSubtitleLang(e.target.value)}
            style={{ width: 80, marginLeft: 10 }}
          />
          <button type="submit" disabled={subLoading || !subtitleTitle} style={{ marginLeft: 10 }}>
            {subLoading ? 'Searching...' : 'Fetch Subtitles'}
          </button>
        </form>
        {subError && <div style={{ color: 'red' }}>{subError}</div>}
        <ul>
          {subtitles.map(sub => (
            <li key={sub.id} style={{ marginBottom: 8 }}>
              <a href={sub.download} target="_blank" rel="noopener noreferrer">{sub.filename || sub.language}</a>
              {sub.language && <span style={{ marginLeft: 8, color: '#888' }}>{sub.language}</span>}
              {sub.release && <span style={{ marginLeft: 8, color: '#888' }}>{sub.release}</span>}
              {sub.uploader && <span style={{ marginLeft: 8, color: '#888' }}>by {sub.uploader}</span>}
              {sub.hearing_impaired && <span style={{ marginLeft: 8, color: '#888' }}>(HI)</span>}
              {typeof sub.downloads === 'number' && <span style={{ marginLeft: 8, color: '#888' }}>{sub.downloads} downloads</span>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Watchlist</h2>
        <ul>
          {watchlist.length === 0 && <li>No movies watched yet.</li>}
          {watchlist.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong> <span style={{ color: '#888' }}>({item.uri})</span> <span style={{ color: '#aaa' }}>{item.watchedAt && new Date(item.watchedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Movie Suggestions</h2>
        <ul>
          {suggestions.length === 0 && <li>No suggestions yet. Add movies to your watchlist!</li>}
          {suggestions.map((movie, i) => (
            <li key={movie.id || i} style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              {movie.poster && <img src={movie.poster} alt={movie.title} style={{ width: 50, marginRight: 10 }} />}
              <div>
                <strong>{movie.title}</strong> <span style={{ color: '#888' }}>{movie.release_date}</span>
                <div style={{ fontSize: '0.9em', color: '#555' }}>{movie.overview}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App; 
 