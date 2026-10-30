import { useState } from 'react'
import './App.css'

const ipuLevels = [
  { label: 'Good', range: '0–50', min: 0, max: 50, tone: 'good' },
  { label: 'Moderate', range: '51–100', min: 51, max: 100, tone: 'moderate' },
  { label: 'Unhealthy', range: '101–200', min: 101, max: 200, tone: 'unhealthy' },
  { label: 'Very unhealthy', range: '201–300', min: 201, max: 300, tone: 'very-unhealthy' },
  { label: 'Hazardous', range: '301+', min: 301, max: 500, tone: 'hazardous' },
]

const adviceByLevel: Record<string, string> = {
  Good: 'Enjoy your usual outdoor activities. Keep checking local updates if conditions change.',
  Moderate: 'Sensitive groups should consider reducing long or strenuous outdoor activity.',
  Unhealthy: 'Limit prolonged outdoor activity. Children, older adults, and people with heart or lung conditions should take extra care.',
  'Very unhealthy': 'Reduce outdoor activity and keep windows closed where practical. Follow advice from local authorities.',
  Hazardous: 'Avoid outdoor activity and follow official health and emergency guidance for your area.',
}

function LeafMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="brand-mark">
      <path d="M31.7 7.4C18.5 7.1 8.3 11.8 8.3 22.2c0 5.5 4 9.2 9.1 9.2 10.5 0 15.1-11.7 14.3-24Z" />
      <path d="M8.7 32.1c4.6-7.4 10-12.7 17-17" />
    </svg>
  )
}

function HazeLandscape() {
  return (
    <div className="landscape" aria-label="Illustration of a city softened by haze" role="img">
      <div className="landscape-sun" />
      <div className="landscape-haze haze-one" />
      <div className="landscape-haze haze-two" />
      <svg className="cityscape" viewBox="0 0 620 430" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path className="hill hill-back" d="M0 302 83 251l59 35 82-91 72 89 60-49 72 42 77-75 115 94v134H0Z" />
        <path className="hill hill-front" d="m0 343 89-54 62 33 71-55 76 52 79-46 61 36 71-59 111 74v106H0Z" />
        <g className="buildings">
          <path d="M83 263h49v101H83zM91 247h32v16H91zM96 229h22v18H96zM102 209h10v20h-10z" />
          <path d="M149 291h64v82h-64zM158 276h46v15h-46z" />
          <path d="M235 276h43v98h-43zM242 250h30v26h-30zM248 231h18v19h-18zM253 210h8v21h-8z" />
          <path d="M303 300h54v74h-54zM310 286h40v14h-40z" />
          <path d="M376 270h50v104h-50zM386 245h30v25h-30z" />
          <path d="M452 294h73v80h-73zM463 276h50v18h-50z" />
        </g>
        <g className="building-lights">
          <path d="M94 276h6v7h-6zm14 0h6v7h-6zm-14 16h6v7h-6zm14 0h6v7h-6zm-14 16h6v7h-6zm62 0h7v7h-7zm19 0h7v7h-7zm-19 16h7v7h-7zm19 0h7v7h-7zm49-31h6v8h-6zm14 0h6v8h-6zm-14 18h6v8h-6zm14 0h6v8h-6zm51 10h7v8h-7zm18 0h7v8h-7zm-18 18h7v8h-7zm87-74h7v8h-7zm18 0h7v8h-7zm-18 18h7v8h-7zm-18 18h7v8h-7zm68 16h7v8h-7zm18 0h7v8h-7z" />
        </g>
        <path className="foreground" d="M0 369c89-26 166 19 252-2 112-28 196-17 368 3v60H0Z" />
        <path className="tree" d="M545 378h10v-97h-10zm5-94c-25-11-35-31-24-45 16 0 25 11 28 29 6-25 22-35 39-30 3 17-10 37-34 46zm-5 24c-22-7-33-22-28-35 16-2 27 7 33 22 2-20 15-31 30-30 5 14-4 32-25 41z" />
      </svg>
      <div className="landscape-caption">
        <span className="caption-dot" />
        <span>Know what’s in the air</span>
      </div>
    </div>
  )
}

function App() {
  const [ipuInput, setIpuInput] = useState('72')
  const ipu = Number(ipuInput)
  const selectedLevel = ipuLevels.find((level) => ipu >= level.min && ipu <= level.max)
  const validIpu = ipuInput !== '' && Number.isInteger(ipu) && ipu >= 0 && ipu <= 500

  return (
    <>
      <header className="site-header">
        <a href="#home" className="brand" aria-label="Haze Aware home">
          <LeafMark />
          <span>haze<span className="brand-light">aware</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#understand">What is haze?</a>
          <a href="#causes">How haze forms</a>
          <a href="#effects">Health effects</a>
          <a href="#protect">Protect yourself</a>
          <a href="#ipu-guide">IPU guide</a>
        </nav>
        <a className="nav-cta" href="https://eqms.doe.gov.my/APIMS/main/" target="_blank" rel="noreferrer">
          Check live IPU <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero section-shell" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> UNDERSTANDING HAZE IN MALAYSIA</div>
            <h1>Haze is more<br />than what you<br /><em>can see.</em></h1>
            <p className="hero-description">
              Learn what causes hazy skies, how the air can affect your health, and what you can do to protect yourself and your community.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#causes">How haze forms <span aria-hidden="true">↓</span></a>
              <a className="text-link" href="#protect">How to stay safer <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">i</span>
              <span>Awareness starts with your local air quality reading.</span>
            </div>
          </div>
          <div className="hero-art">
            <HazeLandscape />
            <div className="art-stamp"><span>MY</span><span>01°</span></div>
            <div className="art-side-note">A clearer view<br />starts with awareness</div>
          </div>
        </section>

        <section className="intro-band" id="understand">
          <div className="section-shell intro-grid">
            <p className="eyebrow intro-label">HAZE, EXPLAINED</p>
            <div>
              <h2>That blurry sky<br /><em>has a story.</em></h2>
              <p className="intro-copy">Haze is air pollution made visible: tiny particles and other pollutants hang in the air and soften the view. It can travel across towns and state borders, so a clear-looking day is not a substitute for checking the air quality.</p>
            </div>
            <a href="https://www.moh.gov.my/" target="_blank" rel="noreferrer" className="intro-source">
              Learn from Malaysia’s Ministry of Health <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="haze-explainer section-shell" id="causes">
          <div className="section-heading explainer-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> WHY THE AIR CHANGES</p>
              <h2>How does haze<br /><em>build up?</em></h2>
            </div>
            <p className="section-heading-copy">Haze has more than one source. Weather and wind help determine how long it stays and where it travels.</p>
          </div>
          <div className="fact-grid">
            <article className="fact-card">
              <span className="fact-number">01 / SOURCES</span>
              <h3>Smoke and emissions</h3>
              <p>Open burning, vegetation or peat fires, and everyday sources such as traffic and industry can release particles and gases into the air.</p>
            </article>
            <article className="fact-card">
              <span className="fact-number">02 / WEATHER</span>
              <h3>Still, dry conditions</h3>
              <p>When rain is scarce and winds are light, pollutants may build up instead of dispersing. Wind shifts can move haze to other areas.</p>
            </article>
            <article className="fact-card">
              <span className="fact-number">03 / PARTICLES</span>
              <h3>Small particles matter</h3>
              <p>Fine particles can irritate the eyes and airways, trigger coughing, and make breathing harder—especially for sensitive groups.</p>
            </article>
          </div>
        </section>

        <section className="health-section" id="effects">
          <div className="section-shell">
            <div className="section-heading health-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-line" /> HAZE AND YOUR HEALTH</p>
                <h2>What might you<br /><em>notice?</em></h2>
              </div>
              <p className="section-heading-copy">The effects depend on the air quality, how long you are exposed, and your health. Pay attention to how you feel.</p>
            </div>
            <div className="health-grid">
              <article className="health-card">
                <h3>Possible effects</h3>
                <ul>
                  <li>Irritated or watery eyes, nose, or throat</li>
                  <li>Coughing, wheezing, or chest discomfort</li>
                  <li>Shortness of breath or worsening asthma</li>
                </ul>
              </article>
              <article className="health-card">
                <h3>Who should take extra care?</h3>
                <ul>
                  <li>Children and older adults</li>
                  <li>People with asthma or other lung conditions</li>
                  <li>People with heart conditions</li>
                </ul>
              </article>
            </div>
            <p className="health-callout"><strong>Need urgent help?</strong> Get medical care for severe or worsening breathing difficulty. Follow advice from Malaysia’s health authorities for current conditions.</p>
          </div>
        </section>

        <section className="ipu-section section-shell" id="ipu-guide">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> READ THE NUMBERS</p>
              <h2>What does your<br /><em>IPU mean?</em></h2>
            </div>
            <p className="section-heading-copy">Malaysia’s Air Pollutant Index (IPU) helps describe air quality. Enter a reading from an official source to see general guidance.</p>
          </div>

          <div className="ipu-card">
            <div className="ipu-card-main">
              <label htmlFor="ipu-input">Your local IPU reading</label>
              <p className="input-hint">Enter a number between 0 and 500</p>
              <div className="ipu-input-wrap">
                <input
                  id="ipu-input"
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  inputMode="numeric"
                  value={ipuInput}
                  onChange={(event) => setIpuInput(event.target.value)}
                  aria-describedby="ipu-result"
                />
                <span>IPU</span>
              </div>
              {validIpu && selectedLevel ? (
                <div className={`ipu-result ${selectedLevel.tone}`} id="ipu-result" aria-live="polite">
                  <span className="result-status"><span className="status-dot" /> {selectedLevel.label}</span>
                  <p>{adviceByLevel[selectedLevel.label]}</p>
                </div>
              ) : (
                <p className="input-error" id="ipu-result" role="alert">Enter a whole number from 0 to 500.</p>
              )}
              <a className="source-link" href="https://eqms.doe.gov.my/APIMS/main" target="_blank" rel="noreferrer">
                Get a current reading from DOE Malaysia <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="ipu-card-scale">
              <p className="scale-title">MALAYSIA IPU CATEGORIES</p>
              <div className="ipu-scale" aria-label="IPU category ranges">
                {ipuLevels.map((level) => (
                  <div className={`scale-row ${validIpu && selectedLevel?.label === level.label ? 'is-selected' : ''}`} key={level.label}>
                    <span className={`scale-color ${level.tone}`} />
                    <span className="scale-name">{level.label}</span>
                    <span className="scale-range">{level.range}</span>
                  </div>
                ))}
              </div>
              <p className="scale-footnote">Guidance is general. Follow current advice from local health authorities.</p>
            </div>
          </div>
        </section>

        <section className="protect-section" id="protect">
          <div className="section-shell">
            <div className="section-heading protect-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-line" /> SMALL STEPS, REAL CARE</p>
                <h2>Make room for<br /><em>better breathing.</em></h2>
              </div>
              <p className="section-heading-copy">A few thoughtful habits can help you and your community prepare when air quality changes.</p>
            </div>
            <div className="care-grid">
              <article className="care-card">
                <span className="care-number">01</span>
                <div className="care-icon icon-window" aria-hidden="true"><span /></div>
                <h3>Check before you go</h3>
                <p>Look up the latest IPU for your area before planning outdoor exercise or activities.</p>
              </article>
              <article className="care-card">
                <span className="care-number">02</span>
                <div className="care-icon icon-mask" aria-hidden="true"><span /></div>
                <h3>Give your lungs a break</h3>
                <p>When readings are unhealthy, reduce time and effort spent outdoors—especially for sensitive groups.</p>
              </article>
              <article className="care-card">
                <span className="care-number">03</span>
                <div className="care-icon icon-heart" aria-hidden="true">♡</div>
                <h3>Look out for each other</h3>
                <p>Check in on children, older neighbours, and anyone with breathing or heart conditions.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="closing-cta section-shell">
          <div className="closing-mark"><LeafMark /></div>
          <div>
            <p className="eyebrow">STAY INFORMED. STAY KIND.</p>
            <h2>A little awareness<br /><em>goes a long way.</em></h2>
          </div>
          <a className="button button-light" href="https://eqms.doe.gov.my/APIMS/main" target="_blank" rel="noreferrer">
            Visit Malaysia’s live IPU portal <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home" className="brand footer-brand"><LeafMark /><span>haze<span className="brand-light">aware</span></span></a>
        <p>Clear information for a hazy day.</p>
        <span className="footer-country">Made for Malaysia <span aria-hidden="true">✳</span></span>
      </footer>
    </>
  )
}

export default App
