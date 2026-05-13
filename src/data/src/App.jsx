import React, { useState, useEffect, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import BufferingSpinner from './components/BufferingSpinner';
import Navbar from './components/Navbar';
import GenreFilter from './components/GenreFilter';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { movies, genres, languages } from './data/movies';

// 3 phases: 'login' → 'buffering' → 'home'
export default function App() {
  const [phase, setPhase] = useState('login');
  const [username, setUsername] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);

  function handleLogin(name) {
    setUsername(name);
    setPhase('buffering');
  }

  // After 2.8 seconds of buffering, go to home
  useEffect(() => {
    if (phase === 'buffering') {
      const timer = setTimeout(() => setPhase('home'), 2800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const topMovies = useMemo(() => movies.filter((m) => m.top), []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesGenre = activeGenre === 'All' || movie.genre.includes(activeGenre);
      const matchesLang = activeLanguage === 'All' || movie.language === activeLanguage;
      const matchesSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesLang && matchesSearch;
    });
  }, [searchQuery, activeGenre, activeLanguage]);

  // ── Login screen
  if (phase === 'login') return <LoginPage onLogin={handleLogin} />;

  // ── Buffering screen
  if (phase === 'buffering') return <BufferingSpinner username={username} />;

  // ── Main app
  return (
    <div className="app">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        onLogout={() => { setPhase('login'); setUsername(''); }}
      />

      <main className="main">

        {/* ── Top Movies Section ── */}
        {searchQuery === '' && activeGenre === 'All' && activeLanguage === 'All' && (
          <section className="top-section">
            <h2 className="section-heading">
              <span className="heading-accent">🏆</span> Top Picks
            </h2>
            <div className="top-grid">
              {topMovies.map((movie, idx) => (
                <div
                  key={movie.id}
                  className="top-card"
                  onClick={() => setSelectedMovie(movie)}
                  style={{ '--delay': `${idx * 0.08}s` }}
                >
                  <span className="top-rank">#{idx + 1}</span>
                  <img src={movie.poster} alt={movie.title} />
                  <div className="top-info">
                    <h3>{movie.title}</h3>
                    <span>⭐ {movie.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Filters ── */}
        <section className="filters-section">
          <div className="filters-row">
            <div className="filter-block">
              <span className="filter-label">Genre</span>
              <GenreFilter
                genres={genres}
                activeGenre={activeGenre}
                setActiveGenre={setActiveGenre}
              />
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
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── All Movies ── */}
        <section>
          <h2 className="section-heading">
            <span className="heading-accent">🎬</span> All Movies
            <span className="results-count">{filteredMovies.length} found</span>
          </h2>

          {filteredMovies.length > 0 ? (
            <div className="movie-grid">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
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
        <p>Built with React + Vite &nbsp;·&nbsp; CineVault 2024</p>
      </footer>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
