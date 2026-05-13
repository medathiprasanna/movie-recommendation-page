import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    onLogin(username.trim());
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="bg-dot" style={{ '--i': i }} />
        ))}
      </div>

      <div className="login-card">
        <div className="login-brand">
          <span>🎬</span>
          <h1>CineVault</h1>
        </div>
        <p className="login-subtitle">Your personal cinema, curated for you.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="pass-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password (min 4 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="login-error">⚠️ {error}</p>}

          <button type="submit" className="login-btn">
            Enter CineVault →
          </button>
        </form>

        <p className="login-hint">Any username &amp; password (4+ chars) works for this demo.</p>
      </div>
    </div>
  );
}
