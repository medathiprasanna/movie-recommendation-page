import React from 'react';

export default function Navbar({ searchQuery, setSearchQuery, username, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🎬</span>
        <span>CineVault</span>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search by title or director..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="navbar-right">
        {username && (
          <span className="navbar-user">Hi, <strong>{username}</strong></span>
        )}
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
