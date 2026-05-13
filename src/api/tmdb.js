const BASE = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export const IMG = (path, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// Map ISO language codes to readable names
export const LANG_NAMES = {
  en: 'English', ko: 'Korean', ja: 'Japanese',
  fr: 'French',  hi: 'Hindi',  es: 'Spanish',
  it: 'Italian', de: 'German', zh: 'Chinese',
  ta: 'Tamil',   te: 'Telugu',
};

// Fetch genre list (id → name map)
export async function fetchGenres() {
  const res = await fetch(`${BASE}/genre/movie/list`, { headers });
  const data = await res.json();
  const map = {};
  data.genres.forEach((g) => { map[g.id] = g.name; });
  return map;
}

// Fetch popular movies
export async function fetchPopular(page = 1) {
  const res = await fetch(`${BASE}/movie/popular?page=${page}`, { headers });
  const data = await res.json();
  return data.results;
}

// Fetch top-rated movies
export async function fetchTopRated() {
  const res = await fetch(`${BASE}/movie/top_rated?page=1`, { headers });
  const data = await res.json();
  return data.results;
}

// Search movies by query
export async function searchMovies(query) {
  const res = await fetch(
    `${BASE}/search/movie?query=${encodeURIComponent(query)}&page=1`,
    { headers }
  );
  const data = await res.json();
  return data.results;
}

// Fetch trailer key for a movie
export async function fetchTrailer(movieId) {
  const res = await fetch(`${BASE}/movie/${movieId}/videos`, { headers });
  const data = await res.json();
  const trailer = data.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  return trailer ? trailer.key : null;
}
