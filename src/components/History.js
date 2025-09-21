import React, { useEffect, useState } from 'react';
import './History.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const History = ({ user }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async (q = '') => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const url = new URL(`${API_BASE_URL}/history`);
      if (q) url.searchParams.set('q', q);
      const token = localStorage.getItem('token') || '';
      const res = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed');
      setItems(data.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory('');
    const onUpdated = () => fetchHistory(search);
    window.addEventListener('analysis:completed', onUpdated);
    return () => window.removeEventListener('analysis:completed', onUpdated);
  }, [user, search]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchHistory(search);
  };

  if (!user) return <div className="history-container">Login to view history.</div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>History</h2>
        <form onSubmit={onSearch} className="history-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history by plant or text"
          />
          <button type="submit">Search</button>
        </form>
      </div>
      {loading && (
        <div className="history-loading">
          <div className="spinner" />
          <div>Fetching your history…</div>
        </div>
      )}
      {error && <div className="history-error">{error}</div>}
      {!loading && items.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-art">🌱</div>
          <div className="history-empty-title">No history found</div>
          <div className="history-empty-sub">Analyze a plant to see it appear here.</div>
        </div>
      )}
      <div className="history-list">
        {items.map((it) => (
          <div key={it.id} className="history-card">
            <div className="history-card-header">
              <div className="history-card-meta">
                {it.uploadedUrl && (
                  <img className="history-thumb" src={it.uploadedUrl} alt={it.plantName || 'Plant'} />
                )}
                <div className="history-title">{(it.plantName || 'Unknown Plant').replace(/^#+\s*/,'').replace(/`/g,'')}</div>
              </div>
              {it.createdAt?.seconds && (
                <div className="history-date">{new Date(it.createdAt.seconds * 1000).toLocaleString()}</div>
              )}
            </div>
            <details className="history-details">
              <summary>View Analysis</summary>
              <pre className="history-analysis">{it.answer}</pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;


