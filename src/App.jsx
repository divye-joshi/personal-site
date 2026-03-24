import { useState, useEffect, useRef } from 'react';
import CanvasAnimation, { SECTIONS } from './components/CanvasAnimation';
import pfpImage from './pfp.png';

// ─── Icon map ────────────────────────────────────────────────────────────────
const ICONS = {
  cv: (
    <svg viewBox="0 0 24 24" width="45" height="45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="45" height="45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" width="45" height="45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
  scholar: (
    <svg viewBox="0 0 24 24" width="45" height="45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l-9 4.5L12 11l9-4.5L12 2z" />
      <path d="M3 6.5V14c0 2 3.5 4.5 9 4.5s9-2.5 9-4.5V6.5" />
      <path d="M12 11v8" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width="45" height="45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const disableHover = () => { window.disableParticleHover = true; };
const enableHover = () => { window.disableParticleHover = false; };

function NavArrow({ direction, onClick }) {
  return (
    <div
      className="nav-arrow"
      onClick={onClick}
      onMouseEnter={disableHover}
      onMouseLeave={enableHover}
    >
      {direction === 'prev'
        ? <svg viewBox="0 0 24 24" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        : <svg viewBox="0 0 24 24" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      }
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [section, setSection] = useState(0);
  const [glassBounds, setGlass] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const scrollLock = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = (dir) => {
    if (scrollLock.current) return;
    scrollLock.current = true;
    setSection(prev =>
      dir === 'next'
        ? (prev + 1) % SECTIONS.length
        : (prev - 1 + SECTIONS.length) % SECTIONS.length
    );
    setTimeout(() => { scrollLock.current = false; }, 800);
  };

  useEffect(() => {
    if (isMobile) return;
    const onWheel = (e) => { if (Math.abs(e.deltaY) >= 50) navigate(e.deltaY > 0 ? 'next' : 'prev'); };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="mobile-blocker">
        <div className="blocker-content">
          <svg viewBox="0 0 24 24" width="60" height="60" stroke="#00ffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '25px' }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h2>Desktop Optimized</h2>
          <p>This interactive physics portfolio is designed exclusively for wider screens.</p>
          <div className="button-hint">Please switch to a desktop device or enable "Desktop Site" in your mobile browser settings to view it.</div>
        </div>
      </div>
    );
  }

  const sec = SECTIONS[section];
  const glassStyle = glassBounds
    ? { left: `${glassBounds.left}px`, top: `${glassBounds.top}px`, width: `${glassBounds.width}px`, height: `${glassBounds.height}px`, opacity: 1 }
    : { opacity: 0 };

  return (
    <div className="app-container">

      <div className="navigation-hint">
        <span className="hint-title">Site Navigation :</span>
        {' '}Scroll Up/Down, click arrows, or hover to interact
      </div>

      <div className="profile-overlay">
        <img
          src={pfpImage}
          alt="Divye Joshi"
          className="glowing-profile"
          onError={(e) => {
            e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
          }}
        />
      </div>

      <div className="text-glass-container" style={glassStyle}>
        <div className="bottom-nav-row">
          <NavArrow direction="prev" onClick={() => navigate('prev')} />
          {sec.links && (
            <div className="links-container" onMouseEnter={disableHover} onMouseLeave={enableHover}>
              {sec.links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="glass-icon">
                  {ICONS[link.icon]}
                </a>
              ))}
            </div>
          )}
          <NavArrow direction="next" onClick={() => navigate('next')} />
        </div>
      </div>

      <CanvasAnimation currentSection={section} onLayoutChange={setGlass} />
    </div>
  );
}
