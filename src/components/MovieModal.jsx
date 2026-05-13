import React, { useEffect, useState } from 'react';
import { fetchTrailer, IMG, LANG_NAMES } from '../api/tmdb';

export default function MovieModal({ movie, genreMap, onClose }) {
  const [trailerId, setTrailerId]       = useState(null);
  const [showTrailer, setShowTrailer]   = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Fetch trailer when movie changes
  useEffect(() => {
    setTrailerId(null);
    setShowTrailer(false);
    setTrailerLoading(true);
    fetchTrailer(movie.id).then((key) => {
      setTrailerId(key);
      setTrailerLoading(false);
    });
  }, [movie.id]);

  if (!movie) return null;

  const genres   = (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);
  const year     = movie.release_date?.split('-')[0] || '—';
  const rating   = movie.vote_average?.toFixed(1);
  const language = LANG_NAMES[movie.original_language] || movie.original_language?.toUpperCase();
  const backdrop = IMG(movie.backdrop_path, 'w1280');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Trailer or Backdrop */}
        {showTrailer && trailerId ? (
          <div className="trailer-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="modal-backdrop-img"
            style={{ backgroundImage: backdrop ? `url(${backdrop})` : 'none' }}
          >
            {trailerLoading ? (
              <div className="trailer-loading">
                <div className="mini-spinner" />
              </div>
            ) : trailerId ? (
              <button className="play-btn" onClick={() => setShowTrailer(true)}>
                <span className="play-icon">▶</span>
                <span>Watch Trailer</span>
              </button>
            ) : (
              <div className="no-trailer">No trailer available</div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{movie.title}</h2>
            <div className="modal-rating">⭐ {rating}</div>
          </div>

          <div className="modal-meta">
            <span>📅 {year}</span>
            <span>🌐 {language}</span>
            <span>🗳️ {movie.vote_count?.toLocaleString()} votes</span>
          </div>

          <div className="modal-genres">
            {genres.map((g) => (
              <span key={g} className="tag tag-lg">{g}</span>
            ))}
          </div>

          <p className="modal-description">{movie.overview}</p>

          {trailerId && (
            <button
              className="trailer-btn"
              onClick={() => setShowTrailer((p) => !p)}
            >
              {showTrailer ? '🎞️ Hide Trailer' : '▶ Watch Trailer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
