import React, { useState, useEffect, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import BufferingSpinner from './components/BufferingSpinner';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import {
  fetchGenres, fetchPopular, fetchTopRated,
  searchMovies, IMG, LANG_NAMES,
} from './api/tmdb';

export default function App() {
  const [phase, setPhase] = useState('login');
  const [username, setUsername] = useState('');

  // Movie data
  const [allMovies, setAllMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [dataReady, setDataReady] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeLanguage, setActiveLanguage] = useState('All');

  const [selectedMovie, setSelectedMovie] = useState(null);

  // Login → buffering → load data → home
  function handleLogin(name) {
    setUsername(name);
    setPhase('buffering');
  }

  useEffect(() => {
    if (phase === 'buffering') {
      // Load movies while buffering animation plays
      Promise.all([fetchGenres(), fetchPopular(), fetchTopRated()])
        .then(([gMap, popular, topRated]) => {
          setGenreMap(gMap);
          setAllMovies(popular);
          // Top rated picks (first 8)
          setTopMovies(topRated.slice(0, 8));
          setDataReady(true);
        })
        .catch(console.error);

      // Minimum 2.8s buffering screen
      const timer = setTimeout(() => {
        setPhase('home');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Genre list derived from loaded movies
  const genres = useMemo(() => {
    const allGenreIds = allMovies.flatMap((m) => m.genre_ids || []);
    const unique = ['All', ...new Set(allGenreIds.map((id) => genreMap[id]).filter(Boolean))];
    return unique;
  }, [allMovies, genreMap]);

  // Language list
  const languages = useMemo(() => {
    const base = allMovies.map((m) => m.original_language);
    const unique = ['All', ...new Set(base)];
    return unique;
  }, [allMovies]);

  // Movies to display after filters
  const displayMovies = useMemo(() => {
    const pool = searchResults ?? allMovies;
    return pool.filter((movie) => {
      const movieGenreNames = (movie.genre_ids || []).map((id) => genreMap[id]);
      const matchesGenre = activeGenre === 'All' || movieGenreNames.includes(activeGenre);
      const matchesLang = activeLanguage === 'All' || movie.original_language === activeLanguage;
      return matchesGenre && matchesLang;
    });
  }, [searchResults, allMovies, activeGenre, activeLanguage, genreMap]);

  // ── Login screen
  if (phase === 'login') return <LoginPage onLogin={handleLogin} />;

  // ── Buffering screen
  if (phase === 'buffering') return <BufferingSpinner username={username} />;

  return (
    <div className="app">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        onLogout={() => { setPhase('login'); setUsername(''); }}
      />

      <main className="main">

        {/* ── Top Rated Section (hidden while searching/filtering) */}
        {!searchQuery && activeGenre === 'All' && activeLanguage === 'All' && (
          <section className="top-section">
            <h2 className="section-heading">
              <span className="heading-accent">🏆</span> Top Rated
            </h2>
            {topMovies.length === 0 ? (
              <div className="skeleton-row">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : (
              <div className="top-grid">
                {topMovies.map((movie, idx) => (
                  <div
                    key={movie.id}
                    className="top-card"
                    onClick={() => setSelectedMovie(movie)}
                    style={{ '--delay': `${idx * 0.07}s` }}
                  >
                    <span className="top-rank">#{idx + 1}</span>
                    <img
                      src={IMG(movie.poster_path)}
                      alt={movie.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="top-info">
                      <h3>{movie.title}</h3>
                      <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Filters */}
        <section className="filters-section">
          <div className="filters-row">
            <div className="filter-block">
              <span className="filter-label">Genre</span>
              <div className="genre-filter">
                {genres.map((g) => (
                  <button
                    key={g}
                    className={`genre-btn ${activeGenre === g ? 'active' : ''}`}
                    onClick={() => setActiveGenre(g)}
                  >{g}</button>
                ))}
              </div>
            </div>
            <div className="filter-block">
              <span className="filter-label">Language</span>
              <div className="genre-filter">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`genre-btn ${activeLanguage === lang ? 'active' : ''}`}
                    onClick={() => setActiveLanguage(lang)}
                  >
                    {lang === 'All' ? 'All' : (LANG_NAMES[lang] || lang.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── All Movies */}
        <section>
          <h2 className="section-heading">
            <span className="heading-accent">🎬</span>
            {searchQuery ? `Results for "${searchQuery}"` : 'Popular Now'}
            <span className="results-count">{displayMovies.length} found</span>
          </h2>

          {!dataReady ? (
            <div className="movie-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton-movie-card" />
              ))}
            </div>
          ) : displayMovies.length > 0 ? (
            <div className="movie-grid">
              {displayMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  genreMap={genreMap}
                  onClick={setSelectedMovie}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🎭</span>
              <p>No movies found. Try a different filter.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Powered by TMDB API &nbsp;·&nbsp; Built with React + Vite &nbsp;·&nbsp; CineVault 2024</p>
      </footer>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          genreMap={genreMap}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
