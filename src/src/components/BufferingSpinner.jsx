import React from 'react';

export default function BufferingSpinner({ username }) {
  return (
    <div className="buffering-screen">
      <div className="buffer-reel">
        <div className="reel-ring" />
        <div className="reel-ring reel-ring--2" />
        <div className="reel-center">🎬</div>
      </div>
      <p className="buffer-text">
        Loading your movies<span className="buffer-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
      {username && (
        <p className="buffer-welcome">Welcome back, <strong>{username}</strong></p>
      )}
      <div className="buffer-bar">
        <div className="buffer-fill" />
      </div>
    </div>
  );
}
