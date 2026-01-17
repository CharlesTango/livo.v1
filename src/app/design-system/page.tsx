import React from 'react';

export default function DesignSystemPage() {
  return (
    <div className="design-system-root">
      {/* Load Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .design-system-root {
          --ds-primary: #FFD74D;
          --ds-secondary: #1A1A1A;
          --ds-bg-main: #F8F8F8;
          --ds-bg-gradient: linear-gradient(135deg, #F8F8F8 0%, #FFF9E6 100%);
          --ds-white: #FFFFFF;
          --ds-light-grey: #F5F5F5;
          --ds-medium-grey: #BDBDBD;
          --ds-dark-grey: #4F4F4F;
          --ds-soft-yellow: #FFF3C4;
          --ds-patterned: repeating-linear-gradient(45deg, #E0E0E0, #E0E0E0 10px, #F5F5F5 10px, #F5F5F5 20px);
          
          --font-heading: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Manrope', sans-serif;
          
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
          color: var(--ds-secondary);
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

        .ds-badge-primary { background: var(--ds-primary); color: var(--ds-secondary); }
        .ds-badge-dark { background: var(--ds-secondary); color: var(--ds-white); }

        .ds-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E0E0E0;
          border: 3px solid var(--ds-white);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      ` }} />

      <header className="mb-16">
        <h1 className="ds-heading-1 mb-4">Crextio Design System</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Visual guidelines and component library for the Crextio Modern Bento aesthetic.
        </p>
      </header>

      {/* 1. Palette */}
      <section className="ds-section">
        <h2 className="ds-section-title">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <div className="ds-color-swatch" style={{ background: '#FFD74D' }}>#FFD74D</div>
            <p className="text-sm font-semibold">Primary (Sun)</p>
          </div>
          <div>
            <div className="ds-color-swatch text-white" style={{ background: '#1A1A1A' }}>#1A1A1A</div>
            <p className="text-sm font-semibold">Secondary (Charcoal)</p>
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
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Heading 1 - Plus Jakarta Sans Bold</p>
            <h1 className="ds-heading-1">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Heading 2 - Plus Jakarta Sans SemiBold</p>
            <h2 className="ds-heading-2">The quick brown fox jumps over the lazy dog</h2>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Body Text - Manrope Regular/Medium</p>
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
                    className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ${i === 3 ? 'bg-ds-primary' : 'bg-secondary'}`}
                    style={{ 
                      height: `${h}%`, 
                      backgroundColor: i === 3 ? '#FFD74D' : '#1A1A1A'
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
              <div className="ds-progress-fill" style={{ width: '65%' }} />
            </div>
            <div className="ds-progress-bar">
              <div className="ds-progress-fill ds-progress-patterned" style={{ width: '40%' }} />
            </div>
            <div className="mt-4 flex justify-between text-xs font-bold">
              <span>Hired</span>
              <span className="text-ds-primary">15%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Navigation Mocks */}
      <section className="ds-section">
        <h2 className="ds-section-title">Navigation Elements</h2>
        <div className="ds-card">
          <nav className="flex bg-gray-100 p-2 rounded-full inline-flex gap-2">
            <button className="ds-btn ds-btn-secondary py-2 px-6">Dashboard</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">People</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">Hiring</button>
            <button className="ds-btn ds-btn-ghost border-none py-2 px-6">Devices</button>
          </nav>
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-gray-200 flex justify-between items-center text-sm text-gray-400">
        <p>© 2026 Crextio Software Corp.</p>
        <p>Design System v1.0</p>
      </footer>
    </div>
  );
}
