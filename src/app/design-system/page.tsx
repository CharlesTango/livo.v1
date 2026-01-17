"use client";

import React, { useState, useEffect } from 'react';

const GOOGLE_FONTS = [
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif" },
  { name: 'Manrope', family: "'Manrope', sans-serif" },
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Outfit', family: "'Outfit', sans-serif" },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
  { name: 'Lexend', family: "'Lexend', sans-serif" },
  { name: 'Public Sans', family: "'Public Sans', sans-serif" },
  { name: 'Poppins', family: "'Poppins', sans-serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Fraunces', family: "'Fraunces', serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
];

export default function DesignSystemPage() {
  const [primaryColor, setPrimaryColor] = useState('#FFD74D');
  const [secondaryColor, setSecondaryColor] = useState('#1A1A1A');
  const [headingFont, setHeadingFont] = useState('Plus Jakarta Sans');
  const [bodyFont, setBodyFont] = useState('Manrope');

  const headingFontData = GOOGLE_FONTS.find(f => f.name === headingFont) || GOOGLE_FONTS[0];
  const bodyFontData = GOOGLE_FONTS.find(f => f.name === bodyFont) || GOOGLE_FONTS[1];

  return (
    <div className="design-system-root">
      {/* Load Google Fonts Dynamically */}
      <link
        href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@600;700;800&family=${bodyFont.replace(/ /g, '+')}:wght@400;500;600&display=swap`}
        rel="stylesheet"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .design-system-root {
          --ds-primary: ${primaryColor};
          --ds-secondary: ${secondaryColor};
          --ds-bg-main: #F8F8F8;
          --ds-bg-gradient: linear-gradient(135deg, #F8F8F8 0%, #FFF9E6 100%);
          --ds-white: #FFFFFF;
          --ds-light-grey: #F5F5F5;
          --ds-medium-grey: #BDBDBD;
          --ds-dark-grey: #4F4F4F;
          --ds-soft-yellow: #FFF3C4;
          --ds-patterned: repeating-linear-gradient(45deg, #E0E0E0, #E0E0E0 10px, #F5F5F5 10px, #F5F5F5 20px);
          
          --font-heading: ${headingFontData.family};
          --font-body: ${bodyFontData.family};
          
          --radius-s: 8px;
          --radius-m: 16px;
          --radius-l: 32px;
          --radius-pill: 9999px;
          
          background: var(--ds-bg-gradient);
          min-height: 100vh;
          padding: 60px 40px;
          color: var(--ds-secondary);
          font-family: var(--font-body);
        }

        .ds-section {
          margin-bottom: 80px;
        }

        .ds-section-title {
          font-family: var(--font-heading);
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 40px;
          border-bottom: 2px solid var(--ds-primary);
          display: inline-block;
          padding-bottom: 8px;
        }

        .ds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .ds-card {
          background: var(--ds-white);
          border-radius: var(--radius-l);
          padding: 32px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease;
        }

        .ds-card:hover {
          transform: translateY(-4px);
        }

        .ds-btn {
          padding: 14px 28px;
          border-radius: var(--radius-pill);
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ds-btn-primary {
          background: var(--ds-primary);
          color: #1A1A1A; /* Fixed contrast for yellow usually */
        }

        .ds-btn-primary:hover {
          filter: brightness(0.95);
        }

        .ds-btn-secondary {
          background: var(--ds-secondary);
          color: var(--ds-white);
        }

        .ds-btn-ghost {
          background: transparent;
          border: 2px solid var(--ds-secondary);
          color: var(--ds-secondary);
        }

        .ds-color-swatch {
          height: 120px;
          border-radius: var(--radius-m);
          margin-bottom: 12px;
          display: flex;
          align-items: flex-end;
          padding: 16px;
          font-weight: 600;
          font-size: 14px;
        }

        .ds-heading-1 { font-family: var(--font-heading); font-size: 48px; font-weight: 800; }
        .ds-heading-2 { font-family: var(--font-heading); font-size: 36px; font-weight: 700; }
        .ds-heading-3 { font-family: var(--font-heading); font-size: 24px; font-weight: 600; }

        .ds-input {
          width: 100%;
          background: var(--ds-light-grey);
          border: 2px solid transparent;
          border-radius: var(--radius-m);
          padding: 16px 20px;
          font-family: var(--font-body);
          transition: all 0.2s ease;
          outline: none;
        }

        .ds-input:focus {
          border-color: var(--ds-primary);
          background: var(--ds-white);
        }

        .ds-progress-bar {
          height: 20px;
          background: var(--ds-light-grey);
          border-radius: var(--radius-pill);
          overflow: hidden;
          margin: 12px 0;
        }

        .ds-progress-fill {
          height: 100%;
          background: var(--ds-primary);
          border-radius: var(--radius-pill);
        }

        .ds-progress-patterned {
          background: var(--ds-patterned);
        }

        .ds-badge {
          padding: 6px 16px;
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .ds-badge-primary { background: var(--ds-primary); color: #1A1A1A; }
        .ds-badge-dark { background: var(--ds-secondary); color: var(--ds-white); }

        .ds-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E0E0E0;
          border: 3px solid var(--ds-white);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .ds-control-panel {
          position: sticky;
          top: 20px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-m);
          padding: 24px;
          margin-bottom: 60px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        }
      ` }} />

      <header className="mb-16">
        <h1 className="ds-heading-1 mb-4 text-secondary">Web Design System</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Visual guidelines and component library. Customize the look and feel using the controls below.
        </p>
      </header>

      {/* Control Panel */}
      <div className="ds-control-panel">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Primary Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-none"
              />
              <span className="font-mono text-sm">{primaryColor.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={secondaryColor} 
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-none"
              />
              <span className="font-mono text-sm">{secondaryColor.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Heading Font</label>
            <select 
              className="ds-input py-2 px-3 text-sm"
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
            >
              {GOOGLE_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Body Font</label>
            <select 
              className="ds-input py-2 px-3 text-sm"
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
            >
              {GOOGLE_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. Palette */}
      <section className="ds-section">
        <h2 className="ds-section-title">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <div className="ds-color-swatch" style={{ background: primaryColor }}>{primaryColor.toUpperCase()}</div>
            <p className="text-sm font-semibold">Primary</p>
          </div>
          <div>
            <div className="ds-color-swatch text-white" style={{ background: secondaryColor }}>{secondaryColor.toUpperCase()}</div>
            <p className="text-sm font-semibold">Secondary</p>
          </div>
          <div>
            <div className="ds-color-swatch border border-gray-200" style={{ background: '#FFFFFF' }}>#FFFFFF</div>
            <p className="text-sm font-semibold">White</p>
          </div>
          <div>
            <div className="ds-color-swatch" style={{ background: '#F5F5F5' }}>#F5F5F5</div>
            <p className="text-sm font-semibold">Light Grey</p>
          </div>
          <div>
            <div className="ds-color-swatch" style={{ background: 'var(--ds-patterned)' }}>Patterned</div>
            <p className="text-sm font-semibold">Patterned Fill</p>
          </div>
          <div>
            <div className="ds-color-swatch" style={{ background: '#FFF3C4' }}>#FFF3C4</div>
            <p className="text-sm font-semibold">Soft Yellow</p>
          </div>
        </div>
      </section>

      {/* 2. Typography */}
      <section className="ds-section">
        <h2 className="ds-section-title">Typography</h2>
        <div className="ds-card space-y-8">
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Heading 1 - {headingFont} Bold</p>
            <h1 className="ds-heading-1">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Heading 2 - {headingFont} SemiBold</p>
            <h2 className="ds-heading-2">The quick brown fox jumps over the lazy dog</h2>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Body Text - {bodyFont} Regular/Medium</p>
            <p className="text-lg leading-relaxed">
              Experience the future of productivity with our bento-inspired interface. 
              Designed for clarity, efficiency, and a touch of warmth.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Buttons */}
      <section className="ds-section">
        <h2 className="ds-section-title">Buttons & Actions</h2>
        <div className="ds-card">
          <div className="flex flex-wrap gap-6 items-center">
            <button className="ds-btn ds-btn-primary">Primary Action</button>
            <button className="ds-btn ds-btn-secondary">Secondary Action</button>
            <button className="ds-btn ds-btn-ghost">Ghost Button</button>
            <button className="ds-btn ds-btn-primary opacity-50 cursor-not-allowed">Disabled</button>
          </div>
        </div>
      </section>

      {/* 4. Form Elements */}
      <section className="ds-section">
        <h2 className="ds-section-title">Form Elements</h2>
        <div className="ds-grid">
          <div className="ds-card">
            <label className="block text-sm font-bold mb-3">Input Field</label>
            <input className="ds-input mb-6" placeholder="Type something..." />
            
            <label className="block text-sm font-bold mb-3">Select Menu</label>
            <select className="ds-input">
              <option>Select an option</option>
              <option>Productivity</option>
              <option>Management</option>
            </select>
          </div>
          <div className="ds-card">
            <h3 className="ds-heading-3 mb-4">Badges & Tags</h3>
            <div className="flex flex-wrap gap-3">
              <span className="ds-badge ds-badge-primary">In Progress</span>
              <span className="ds-badge ds-badge-dark">Completed</span>
              <span className="ds-badge" style={{ background: '#E0E0E0' }}>Draft</span>
              <span className="ds-badge" style={{ background: '#FFF3C4', color: '#B45309' }}>Pending</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bento Cards & Components */}
      <section className="ds-section">
        <h2 className="ds-section-title">Bento Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ds-card md:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h3 className="ds-heading-3">Weekly Progress</h3>
              <span className="ds-badge ds-badge-primary">Live</span>
            </div>
            <div className="flex items-end gap-4 h-32 mb-6">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-xl overflow-hidden relative" style={{ height: '100%' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500`}
                    style={{ 
                      height: `${h}%`, 
                      backgroundColor: i === 3 ? primaryColor : secondaryColor
                    }} 
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">Projected output increased by 12% this week.</p>
          </div>

          <div className="ds-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="ds-avatar" />
              <div>
                <h4 className="font-bold">Lora Piterson</h4>
                <p className="text-xs text-gray-500">UX/UI Designer</p>
              </div>
            </div>
            <div className="ds-progress-bar">
              <div className="ds-progress-fill" style={{ width: '65%', backgroundColor: primaryColor }} />
            </div>
            <div className="ds-progress-bar">
              <div className="ds-progress-fill ds-progress-patterned" style={{ width: '40%' }} />
            </div>
            <div className="mt-4 flex justify-between text-xs font-bold">
              <span>Hired</span>
              <span style={{ color: primaryColor }}>15%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Navigation Mocks */}
      <section className="ds-section">
        <h2 className="ds-section-title">Navigation Elements</h2>
        <div className="ds-card">
          <nav className="inline-flex bg-gray-100 p-2 rounded-full gap-2">
            <button className="ds-btn ds-btn-secondary py-2 px-6">Dashboard</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">People</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">Hiring</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">Devices</button>
          </nav>
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-gray-200 flex justify-between items-center text-sm text-gray-400">
        <p>© 2026 Web Design System Guide</p>
        <p>Version 1.1</p>
      </footer>
    </div>
  );
}
