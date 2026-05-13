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
  // Phase: 'login' → 'buffering' → 'home'
  const [phase, setPhase]       = useState('login');
  const [username, setUsername] = useState('');

  // Data from TMDB
  const [allMovies, setAllMovies]   = useState([]);
  const [topMovies, setTopMovies]   = useState([]);
  const [genreMap, setGenreMap]     = useState({});
  const [dataReady, setDataReady]   = useState(false);

  // Filters
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeGenre, setActiveGenre]     = useState('All');
  const [activeLanguage, setActiveLanguage] = useState('All');

  const [selectedMovie, setSelectedMovie] = useState(null);

  function handleLogin(name) {
    setUsername(name);
    setPhase('buffering');
  }

  function handleLogout() {
    setPhase('login');
    setUsername('');
    setSearchQuery('');
    setActiveGenre('All');
    setActiveLanguage('All');
  }

  // Start loading data during buffering
  useEffect(() => {
    if (phase !== 'buffering') return;

    Promise.all([fetchGenres(), fetchPopular(), fetchTopRated()])
      .then(([gMap, popular, topRated]) => {
        setGenreMap(gMap);
        setAllMovies(popular);
        setTopMovies(topRated.slice(0, 8));
        setDataReady(true);
      })
      .catch(console.error);

    const timer = setTimeout(() => setPhase('home'), 2800);
    return () => clearTimeout(timer);
  }, [phase]);

  // Search with debounce (400ms)
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
      } catch (e) { console.error(e); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Build genre list from loaded movies
  const genres = useMemo(() => {
    const ids = allMovies.flatMap((m) => m.genre_ids || []);
    return ['All', ...new Set(ids.map((id) => genreMap[id]).filter(Boolean))];
  }, [allMovies, genreMap]);

  // Build language list from loaded movies
  const languages = useMemo(() => {
    const langs = allMovies.map((m) => m.original_language).filter(Boolean);
    return ['All', ...new Set(langs)];
  }, [allMovies]);

  // Apply genre + language filters
  const displayMovies = useMemo(() => {
    const pool = searchResults ?? allMovies;
    return pool.filter((movie) => {
      const movieGenres = (movie.genre_ids || []).map((id) => genreMap[id]);
      const matchesGenre    = activeGenre === 'All' || movieGenres.includes(activeGenre);
      const matchesLanguage = activeLanguage === 'All' || movie.original_language === activeLanguage;
      return matchesGenre && matchesLanguage;
    });
  }, [searchResults, allMovies, activeGenre, activeLanguage, genreMap]);

  const isFiltering = searchQuery || activeGenre !== 'All' || activeLanguage !== 'All';

  if (phase === 'login')     return <LoginPage onLogin={handleLogin} />;
  if (phase === 'buffering') return <BufferingSpinner username={username} />;

  return (
    <div className="app">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        username={username}
        onLogout={handleLogout}
      />

      <main className="main">

        {/* ── Top Rated (hidden while filtering) */}
        {!isFiltering && (
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
                    className={`genre-btn ${activeGenre === g
