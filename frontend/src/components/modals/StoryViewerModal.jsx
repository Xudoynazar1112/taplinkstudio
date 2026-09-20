import React, { useState, useEffect } from 'react';

export default function StoryViewerModal({ stories = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex] || {};

  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const step = 50;
    const increment = (step / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            clearInterval(interval);
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop story-viewer-backdrop" onClick={onClose}>
      <div className="story-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars for each story */}
        <div className="story-progress-bar-row">
          {stories.map((_, idx) => (
            <div key={idx} className="story-progress-track">
              <div
                className="story-progress-fill"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="story-header-row">
          <div className="story-author">
            <span className="story-icon">✨</span>
            <span className="story-title">{currentStory.title || 'Hikoya'}</span>
          </div>
          <button className="story-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Story Content Area */}
        <div className="story-content-body">
          {currentStory.preview && (
            <img src={currentStory.preview} alt="Story visual" className="story-bg-media" />
          )}
          <div className="story-text-overlay">
            <h3>{currentStory.title}</h3>
            {currentStory.content && <p>{currentStory.content}</p>}
            {currentStory.link && (
              <a
                href={currentStory.link}
                target="_blank"
                rel="noreferrer"
                className="story-cta-btn"
              >
                Batafsil ko'rish ↗
              </a>
            )}
          </div>
        </div>

        {/* Tap zones for Left & Right navigation */}
        <div className="story-tap-left" onClick={handlePrev} />
        <div className="story-tap-right" onClick={handleNext} />
      </div>
    </div>
  );
}
