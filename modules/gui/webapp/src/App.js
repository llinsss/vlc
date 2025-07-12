import React, { useEffect, useState } from 'react';
import * as api from './api';

const cardStyle = {
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 24,
  marginBottom: 32,
  border: '1px solid #eee',
};
const sectionTitle = {
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 16,
  color: '#2d3748',
};
const labelStyle = { fontWeight: 500, color: '#444', marginRight: 8 };
const inputStyle = {
  padding: '8px 12px',
  borderRadius: 5,
  border: '1px solid #ccc',
  fontSize: 16,
};
const buttonStyle = {
  padding: '8px 18px',
  borderRadius: 5,
  border: 'none',
  background: '#3182ce',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  marginLeft: 10,
};
const spinner = <span style={{ marginLeft: 8, color: '#3182ce' }}>⏳</span>;

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
  const [sttFile, setSttFile] = useState(null);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttError, setSttError] = useState('');
  const [sttSrt, setSttSrt] = useState('');

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
  const handleSttFileChange = (e) => {
    setSttFile(e.target.files[0]);
    setSttSrt('');
    setSttError('');
  };
  const handleSttGenerate = async (e) => {
    e.preventDefault();
    if (!sttFile) return;
    setSttLoading(true);
    setSttError('');
    setSttSrt('');
    try {
      const srt = await api.generateSubtitles(sttFile);
      setSttSrt(srt);
    } catch (err) {
      setSttError('Failed to generate subtitles.');
    }
    setSttLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'Inter, sans-serif', background: '#f7fafc', padding: 24, borderRadius: 12 }}>
      <h1 style={{ textAlign: 'center', color: '#2b6cb0', fontWeight: 800, fontSize: 36, marginBottom: 32 }}>mediaInk Web/Desktop App</h1>
      <div style={cardStyle}>
        <div style={sectionTitle}>Playback Controls</div>
        <div style={{ marginBottom: 16 }}>
          <button style={buttonStyle} onClick={handlePlay} disabled={loading}>Play {loading && spinner}</button>
          <button style={buttonStyle} onClick={handlePause} disabled={loading}>Pause {loading && spinner}</button>
          <button style={buttonStyle} onClick={handleStop} disabled={loading}>Stop {loading && spinner}</button>
          <button style={buttonStyle} onClick={handlePrevious} disabled={loading}>Previous {loading && spinner}</button>
          <button style={buttonStyle} onClick={handleNext} disabled={loading}>Next {loading && spinner}</button>
        </div>
        <div style={{ marginTop: 10, color: '#444' }}>
          <span style={labelStyle}>Status:</span> {status ? status.state : 'N/A'}<br />
          <span style={labelStyle}>Now Playing:</span> {status && status.information && status.information.category && status.information.category.meta ? status.information.category.meta.filename : 'N/A'}
        </div>
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>Play or Enqueue a File</div>
        <form style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="File URI or path"
            value={uri}
            onChange={e => setUri(e.target.value)}
            style={{ ...inputStyle, width: 300 }}
          />
          <input
            type="text"
            placeholder="Title (for watchlist)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ ...inputStyle, width: 200 }}
          />
          <button onClick={handlePlayFile} disabled={loading} style={buttonStyle}>Play</button>
          <button onClick={handleEnqueueFile} disabled={loading} style={buttonStyle}>Enqueue</button>
        </form>
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>Subtitle Generation / Fetching</div>
        <form onSubmit={handleFetchSubtitles} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Movie title"
            value={subtitleTitle}
            onChange={e => setSubtitleTitle(e.target.value)}
            style={{ ...inputStyle, width: 200 }}
          />
          <input
            type="text"
            placeholder="Language (e.g. en, fr)"
            value={subtitleLang}
            onChange={e => setSubtitleLang(e.target.value)}
            style={{ ...inputStyle, width: 80 }}
          />
          <button type="submit" disabled={subLoading || !subtitleTitle} style={buttonStyle}>
            {subLoading ? 'Searching...' : 'Fetch Subtitles'}
          </button>
        </form>
        {subError && <div style={{ color: 'red', marginBottom: 8 }}>{subError}</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {subtitles.map(sub => (
            <li key={sub.id} style={{ marginBottom: 12, background: '#f1f5f9', borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center' }}>
              <a href={sub.download} target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0', fontWeight: 600, textDecoration: 'underline' }}>{sub.filename || sub.language}</a>
              {sub.language && <span style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>{sub.language}</span>}
              {sub.release && <span style={{ marginLeft: 8, color: '#888', fontSize: 14 }}>{sub.release}</span>}
              {sub.uploader && <span style={{ marginLeft: 8, color: '#888', fontSize: 14 }}>by {sub.uploader}</span>}
              {sub.hearing_impaired && <span style={{ marginLeft: 8, color: '#888', fontSize: 14 }}>(HI)</span>}
              {typeof sub.downloads === 'number' && <span style={{ marginLeft: 8, color: '#888', fontSize: 14 }}>{sub.downloads} downloads</span>}
            </li>
          ))}
        </ul>
        <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />
        <div style={{ fontWeight: 500, marginBottom: 8 }}>Generate Subtitles from Media (Speech-to-Text)</div>
        <form onSubmit={handleSttGenerate} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <input type="file" accept="audio/*,video/*" onChange={handleSttFileChange} style={{ ...inputStyle, width: 250 }} />
          <button type="submit" disabled={sttLoading || !sttFile} style={buttonStyle}>
            {sttLoading ? 'Generating...' : 'Generate Subtitles'}
          </button>
        </form>
        {sttError && <div style={{ color: 'red', marginBottom: 8 }}>{sttError}</div>}
        {sttSrt && (
          <div style={{ marginTop: 10 }}>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(sttSrt)}`}
              download={sttFile ? sttFile.name.replace(/\.[^/.]+$/, '') + '.srt' : 'subtitles.srt'}
              style={{ ...buttonStyle, background: '#38a169', marginLeft: 0 }}
            >
              Download SRT
            </a>
            <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, marginTop: 10, maxHeight: 300, overflow: 'auto', fontSize: 14 }}>{sttSrt.slice(0, 5000)}{sttSrt.length > 5000 ? '\n... (truncated)' : ''}</pre>
          </div>
        )}
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>Watchlist</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {watchlist.length === 0 && <li style={{ color: '#888' }}>No movies watched yet.</li>}
          {watchlist.map((item, i) => (
            <li key={i} style={{ marginBottom: 10, background: '#f1f5f9', borderRadius: 6, padding: 10 }}>
              <strong style={{ color: '#2b6cb0' }}>{item.title}</strong> <span style={{ color: '#888' }}>({item.uri})</span> <span style={{ color: '#aaa' }}>{item.watchedAt && new Date(item.watchedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={cardStyle}>
        <div style={sectionTitle}>Movie Suggestions</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {suggestions.length === 0 && <li style={{ color: '#888' }}>No suggestions yet. Add movies to your watchlist!</li>}
          {suggestions.map((movie, i) => (
            <li key={movie.id || i} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 6, padding: 10 }}>
              {movie.poster && <img src={movie.poster} alt={movie.title} style={{ width: 50, marginRight: 14, borderRadius: 4 }} />}
              <div>
                <strong style={{ color: '#2b6cb0' }}>{movie.title}</strong> <span style={{ color: '#888' }}>{movie.release_date}</span>
                <div style={{ fontSize: '0.95em', color: '#555', marginTop: 2 }}>{movie.overview}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App; 
 