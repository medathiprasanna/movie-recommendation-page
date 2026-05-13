import React, { useState } from 'react';
import { IMG } from '../api/tmdb';

export default function MovieCard({ movie, genreMap, onClick }) {
  const [imgError, setImgError] = useState(false);
  const genres = (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);
  const year = movie.release_date?.split('-')[0];

  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="card-poster">
        {!imgError && IMG(movie.poster_path) ? (
          <img
            src={IMG(movie.poster_path)}
            alt={movie.title}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="poster-fallback">
            <span>🎞️</span>
            <p>{movie.title}</p>
          </div>
        )}
        <div className="card-overlay">
          <span className="view-label">View Details</span>
        </div>
      </div>
      <div className="card-info">
        <div className="card-header">
          <h3 className="card-title">{movie.title}</h3>
          <span className="card-rating">⭐ {movie.vote_average?.toFixed(1)}</span>
        </div>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          <div className="card-genres">
            {genres.slice(0, 2).map((g) => (
              <span key={g} className="tag">{g}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
