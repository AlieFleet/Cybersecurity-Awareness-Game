import { useEffect, useState } from 'react'
import './App.css'

const causes = [
  'Open burning, wildfire smoke, and dust storms',
  'Vehicle emissions and industrial pollution',
  'Weather patterns that trap pollutants close to the ground',
]

const symptoms = [
  'Coughing or throat irritation',
  'Watery eyes and headaches',
  'Shortness of breath or wheezing',
  'Fatigue and reduced focus',
]

const preventionTips = [
  'Check local air quality before outdoor activity.',
  'Wear an N95 mask when haze is heavy or indoors if needed.',
  'Keep windows closed and use clean indoor air filters.',
  'Drink water and limit strenuous exercise outdoors.',
]

const riskProfiles = {
  general: {
    label: 'General guidance',
    advice: 'Check the AQI before outdoor plans and reduce strenuous activity when it rises.',
  },
  asthma: {
    label: 'Asthma or lung condition',
    advice: 'Keep prescribed medication available, follow your care plan, and avoid outdoor exertion when air quality worsens.',
  },
  children: {
    label: 'Children',
    advice: 'Move active play indoors when air quality is poor and check children for coughing or breathing discomfort.',
  },
  olderAdults: {
    label: 'Older adults',
    advice: 'Plan errands for cleaner-air periods and avoid heavy outdoor exertion on unhealthy days.',
  },
}

const checklistItems = [
  { id: 'check', label: 'Check today\'s air quality before going out' },
  { id: 'room', label: 'Prepare a clean-air room with windows closed' },
  { id: 'mask', label: 'Keep a well-fitting respirator ready for necessary trips' },
  { id: 'people', label: 'Check in with someone more sensitive to haze' },
]

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function getTodayChecklist() {
  const today = new Date().toLocaleDateString()
  const saved = readStoredValue('hazeaware.checklist', null)
  if (saved?.date === today) return saved.items
  return Object.fromEntries(checklistItems.map((item) => [item.id, false]))
}

function getAqiCategory(aqi) {
  if (aqi <= 50) return { label: 'Good', className: 'good' }
  if (aqi <= 100) return { label: 'Moderate', className: 'moderate' }
  if (aqi <= 150) return { label: 'Unhealthy for sensitive groups', className: 'sensitive' }
  if (aqi <= 200) return { label: 'Unhealthy', className: 'unhealthy' }
  if (aqi <= 300) return { label: 'Very unhealthy', className: 'very-unhealthy' }
  return { label: 'Hazardous', className: 'hazardous' }
}

async function fetchAirQuality(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'us_aqi,pm2_5',
    hourly: 'us_aqi,pm2_5',
    forecast_days: '2',
    timezone: 'auto',
  })
  const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
  if (!response.ok) throw new Error('Air quality data is temporarily unavailable.')
  const result = await response.json()
  if (result.current?.us_aqi == null) throw new Error('No current air quality reading was found.')
  return result
}

function formatAirQuality(reading, locationName, latitude, longitude) {
  const times = reading.hourly?.time || []
  const matchedIndex = times.indexOf(reading.current.time)
  const startIndex = matchedIndex < 0 ? 0 : matchedIndex
  const hourly = times.slice(startIndex, startIndex + 24).map((time, index) => {
    const dataIndex = startIndex + index
    return {
      time,
      aqi: reading.hourly.us_aqi[dataIndex],
      pm25: reading.hourly.pm2_5[dataIndex],
    }
  }).filter((hour) => hour.aqi != null)

  return {
    aqi: Math.round(reading.current.us_aqi),
    pm25: reading.current.pm2_5,
    time: reading.current.time,
    city: locationName,
    latitude,
    longitude,
    hourly,
  }
}

async function fetchCityAirQuality(query) {
  const params = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' })
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  if (!response.ok) throw new Error('City search is temporarily unavailable.')
  const result = await response.json()
  const place = result.results?.[0]
  if (!place) throw new Error('We could not find that city. Try another name.')

  const reading = await fetchAirQuality(place.latitude, place.longitude)
  return {
    city: place.name,
    airQuality: formatAirQuality(
      reading,
      [place.name, place.country].filter(Boolean).join(', '),
      place.latitude,
      place.longitude,
    ),
  }
}

function App() {
  const [city, setCity] = useState('Singapore')
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [savedPlaces, setSavedPlaces] = useState(() => readStoredValue('hazeaware.places', []))
  const [riskProfile, setRiskProfile] = useState(() => readStoredValue('hazeaware.profile', 'general'))
  const [alertThreshold, setAlertThreshold] = useState(() => readStoredValue('hazeaware.threshold', 100))
  const [alertsEnabled, setAlertsEnabled] = useState(() => readStoredValue('hazeaware.alerts', false))
  const [checklist, setChecklist] = useState(getTodayChecklist)
  const [shareMessage, setShareMessage] = useState('')

  async function searchCity(event) {
    event?.preventDefault()
    const query = city.trim()
    if (!query) return

    setIsLoading(true)
    setError('')
    try {
      const result = await fetchCityAirQuality(query)
      setAirQuality(result.airQuality)
      setCity(result.city)
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to load air quality right now.')
    } finally {
      setIsLoading(false)
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Location is not available in this browser. Search for a city instead.')
      return
    }

    setIsLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const reading = await fetchAirQuality(coords.latitude, coords.longitude)
        setAirQuality(formatAirQuality(reading, 'Your location', coords.latitude, coords.longitude))
      } catch (lookupError) {
        setError(lookupError.message || 'Unable to load air quality right now.')
      } finally {
        setIsLoading(false)
      }
    }, () => {
      setError('Location permission was not granted. Search for a city instead.')
      setIsLoading(false)
    })
  }

  useEffect(() => {
    let isCurrent = true
    fetchCityAirQuality('Singapore')
      .then((result) => {
        if (isCurrent) {
          setAirQuality(result.airQuality)
          setCity(result.city)
        }
      })
      .catch((lookupError) => {
        if (isCurrent) setError(lookupError.message || 'Unable to load air quality right now.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if (!airQuality || !alertsEnabled || !('Notification' in window)) return
    if (Notification.permission !== 'granted' || airQuality.aqi < alertThreshold) return

    const alertKey = `${airQuality.city}:${airQuality.time}:${alertThreshold}`
    if (readStoredValue('hazeaware.lastAlert', '') === alertKey) return

    new Notification(`Air quality alert for ${airQuality.city}`, {
      body: `AQI is ${airQuality.aqi}. ${getAqiCategory(airQuality.aqi).label}. Consider limiting outdoor activity.`,
    })
    writeStoredValue('hazeaware.lastAlert', alertKey)
  }, [airQuality, alertsEnabled, alertThreshold])

  useEffect(() => {
    if (!airQuality) return undefined
    const intervalId = window.setInterval(async () => {
      try {
        const reading = await fetchAirQuality(airQuality.latitude, airQuality.longitude)
        setAirQuality(formatAirQuality(reading, airQuality.city, airQuality.latitude, airQuality.longitude))
      } catch {
        setError('Automatic update failed. Use Refresh to try again.')
      }
    }, 30 * 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [airQuality])

  async function refreshAirQuality() {
    if (!airQuality) return
    setIsRefreshing(true)
    setError('')
    try {
      const reading = await fetchAirQuality(airQuality.latitude, airQuality.longitude)
      setAirQuality(formatAirQuality(reading, airQuality.city, airQuality.latitude, airQuality.longitude))
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to refresh air quality right now.')
    } finally {
      setIsRefreshing(false)
    }
  }

  function saveCurrentPlace() {
    if (!airQuality) return
    const place = {
      city: airQuality.city,
      latitude: airQuality.latitude,
      longitude: airQuality.longitude,
    }
    const nextPlaces = [
      place,
      ...savedPlaces.filter((saved) => saved.latitude !== place.latitude || saved.longitude !== place.longitude),
    ].slice(0, 5)
    setSavedPlaces(nextPlaces)
    writeStoredValue('hazeaware.places', nextPlaces)
  }

  async function selectSavedPlace(place) {
    setCity(place.city.split(',')[0])
    setIsLoading(true)
    setError('')
    try {
      const reading = await fetchAirQuality(place.latitude, place.longitude)
      setAirQuality(formatAirQuality(reading, place.city, place.latitude, place.longitude))
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to load this saved location.')
    } finally {
      setIsLoading(false)
    }
  }

  async function enableAlerts() {
    if (!('Notification' in window)) {
      setError('This browser does not support desktop notifications.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setAlertsEnabled(true)
      writeStoredValue('hazeaware.alerts', true)
      setError('')
    } else {
      setError('Notifications are blocked. You can allow them in your browser settings.')
    }
  }

  function updateAlertThreshold(value) {
    const nextThreshold = Number(value)
    setAlertThreshold(nextThreshold)
    writeStoredValue('hazeaware.threshold', nextThreshold)
  }

  function updateRiskProfile(value) {
    setRiskProfile(value)
    writeStoredValue('hazeaware.profile', value)
  }

  function toggleChecklistItem(itemId) {
    setChecklist((current) => {
      const next = { ...current, [itemId]: !current[itemId] }
      writeStoredValue('hazeaware.checklist', { date: new Date().toLocaleDateString(), items: next })
      return next
    })
  }

  async function shareAirQuality() {
    if (!airQuality) return
    const details = `AQI ${airQuality.aqi} (${getAqiCategory(airQuality.aqi).label}), PM2.5 ${airQuality.pm25} µg/m³ in ${airQuality.city}.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'HazeAware air quality', text: details, url: window.location.href })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${details} ${window.location.href}`)
        setShareMessage('Reading copied to clipboard.')
      } else {
        setShareMessage('Sharing is not supported in this browser.')
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') setShareMessage('Could not share this reading.')
    }
  }

  const category = airQuality ? getAqiCategory(airQuality.aqi) : null
  const checklistProgress = Object.values(checklist).filter(Boolean).length
  const isCurrentPlaceSaved = airQuality && savedPlaces.some(
    (place) => place.latitude === airQuality.latitude && place.longitude === airQuality.longitude,
  )
  const quickStats = [
    {
      label: 'PM2.5 concentration',
      value: airQuality?.pm25 == null ? (isLoading ? 'Loading...' : 'Unavailable') : `${airQuality.pm25} µg/m³`,
    },
    { label: 'Health risk', value: category?.label || (isLoading ? 'Loading...' : 'Unavailable') },
    {
      label: 'Best action',
      value: !airQuality
        ? 'Check local conditions'
        : airQuality.aqi > 150
          ? 'Limit time outdoors'
          : airQuality.aqi > 100
            ? 'Reduce outdoor exercise'
            : 'Enjoy outdoor activity',
    },
  ]

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">H</div>
          <div>
            <p className="brand-name">HazeAware</p>
            <p className="brand-tag">Clean air matters</p>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#causes">Causes</a>
          <a href="#symptoms">Symptoms</a>
          <a href="#tips">Tips</a>
          <a href="#tools">Tools</a>
        </nav>

        <a className="nav-button" href="#tips">Learn more</a>
      </header>

      <main className="content">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Haze awareness</p>
            <h1>Protect your lungs when the air turns unsafe.</h1>
            <p className="lead">
              Haze is more than a gloomy sky. It can carry tiny particles that irritate
              the eyes, throat, and lungs, especially for children, older adults, and
              people with asthma.
            </p>

            <div className="hero-actions">
              <a href="#air-quality" className="primary-btn">
                Check air quality
              </a>
              <a href="#symptoms" className="secondary-btn">
                Know the warning signs
              </a>
            </div>

            <div className="stats-row" aria-label="Quick haze facts">
              {quickStats.map((stat) => (
                <div key={stat.label} className="stat-box">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="air-quality" className="hero-panel" aria-label="Air quality summary">
            <div className="panel-card">
              <span className="panel-tag">Air quality index</span>
              <form className="city-search" onSubmit={searchCity}>
                <label htmlFor="city-search">Search a city</label>
                <div className="search-row">
                  <input
                    id="city-search"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Enter a city"
                  />
                  <button className="search-button" type="submit" disabled={isLoading}>
                    Search
                  </button>
                </div>
                <button className="location-button" type="button" onClick={useMyLocation} disabled={isLoading}>
                  Use my location
                </button>
              </form>

              <div className={`aqi-reading ${category?.className || ''}`} aria-live="polite">
                {isLoading && !airQuality ? 'Loading...' : airQuality ? `AQI ${airQuality.aqi}` : '--'}
              </div>
              {error ? (
                <p className="panel-error" role="alert">{error}</p>
              ) : (
                <p className={`panel-status ${category?.className || ''}`}>
                  {isLoading && airQuality ? 'Updating reading...' : category?.label || 'Searching for current air quality'}
                </p>
              )}

              {airQuality && (
                <>
                  <p className="location-label">{airQuality.city}</p>
                  <ul className="panel-list">
                    <li>PM2.5: {airQuality.pm25 == null ? 'Not available' : `${airQuality.pm25} µg/m³`}</li>
                    <li>{airQuality.aqi > 100 ? 'Reduce outdoor exercise' : 'Air quality is suitable for most outdoor activities'}</li>
                    <li>{airQuality.aqi > 150 ? 'Keep windows closed and filter indoor air' : 'Check again if conditions change'}</li>
                  </ul>
                  <button className="share-button" type="button" onClick={shareAirQuality}>Share this reading</button>
                  {shareMessage && <p className="share-message" role="status">{shareMessage}</p>}
                  <p className="reading-time">Modelled estimate · Open-Meteo · {airQuality.time}</p>
                  <p className="reading-note">Follow official local health advisories.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section id="tools" className="dashboard-grid" aria-label="Air quality tools">
          <article id="outlook" className="tool-panel forecast-panel">
            <div className="tool-heading">
              <div>
                <p className="eyebrow">Next 24 hours</p>
                <h2>Air quality outlook</h2>
              </div>
              <button className="quiet-button" type="button" onClick={refreshAirQuality} disabled={!airQuality || isRefreshing}>
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </button>
            </div>
            {airQuality?.hourly?.length ? (
              <>
                <div className="forecast-chart" role="img" aria-label="Hourly AQI forecast for the next 24 hours">
                  {airQuality.hourly.slice(0, 12).map((hour, index) => {
                    const height = Math.max(8, Math.min(100, (hour.aqi / 200) * 100))
                    return (
                      <div className="forecast-hour" key={hour.time} title={`${hour.time.slice(11, 16)}: AQI ${hour.aqi}`}>
                        <span className={`forecast-bar ${getAqiCategory(hour.aqi).className}`} style={{ height: `${height}%` }} />
                        {index % 3 === 0
                          ? <span className="forecast-time">{hour.time.slice(11, 16)}</span>
                          : <span className="forecast-time empty" aria-hidden="true" />}
                      </div>
                    )
                  })}
                </div>
                <div className="forecast-legend"><span>AQI estimate</span><span>Updated {airQuality.time}</span></div>
              </>
            ) : (
              <p className="muted-copy">The hourly outlook will appear when a location is loaded.</p>
            )}
          </article>

          <article className="tool-panel saved-panel">
            <div className="tool-heading">
              <div>
                <p className="eyebrow">Your places</p>
                <h2>Saved locations</h2>
              </div>
              <button className="quiet-button" type="button" onClick={saveCurrentPlace} disabled={!airQuality || isCurrentPlaceSaved}>
                {isCurrentPlaceSaved ? 'Saved' : 'Save current'}
              </button>
            </div>
            {savedPlaces.length ? (
              <div className="saved-place-list">
                {savedPlaces.map((place) => (
                  <button className="saved-place" type="button" key={`${place.latitude}-${place.longitude}`} onClick={() => selectSavedPlace(place)}>
                    <span>{place.city}</span><span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted-copy">Save home, work, or family locations for quick checks.</p>
            )}
          </article>

          <article className="tool-panel profile-panel">
            <div className="tool-heading">
              <div>
                <p className="eyebrow">Personal guidance</p>
                <h2>Who are you checking for?</h2>
              </div>
            </div>
            <label className="field-label" htmlFor="risk-profile">Choose a health profile</label>
            <select id="risk-profile" value={riskProfile} onChange={(event) => updateRiskProfile(event.target.value)}>
              {Object.entries(riskProfiles).map(([value, profile]) => (
                <option key={value} value={value}>{profile.label}</option>
              ))}
            </select>
            <p className="profile-advice">{riskProfiles[riskProfile]?.advice || riskProfiles.general.advice}</p>
          </article>

          <article className="tool-panel alerts-panel">
            <div className="tool-heading">
              <div>
                <p className="eyebrow">Optional alerts</p>
                <h2>Know when AQI gets high</h2>
              </div>
            </div>
            <label className="field-label" htmlFor="alert-threshold">Notify me at AQI</label>
            <select id="alert-threshold" value={alertThreshold} onChange={(event) => updateAlertThreshold(event.target.value)}>
              <option value={51}>51 · Moderate</option>
              <option value={101}>101 · Unhealthy for sensitive groups</option>
              <option value={151}>151 · Unhealthy</option>
              <option value={201}>201 · Very unhealthy</option>
            </select>
            <button className="alert-toggle" type="button" onClick={() => alertsEnabled ? (setAlertsEnabled(false), writeStoredValue('hazeaware.alerts', false)) : enableAlerts()}>
              {alertsEnabled ? 'Turn alerts off' : 'Enable browser alerts'}
            </button>
            <p className="muted-copy">Alerts work while this page is open and browser notifications are allowed.</p>
          </article>

          <article className="tool-panel checklist-panel">
            <div className="tool-heading">
              <div>
                <p className="eyebrow">Daily readiness</p>
                <h2>Haze safety checklist</h2>
              </div>
              <span className="progress-count">{checklistProgress}/{checklistItems.length}</span>
            </div>
            <progress className="checklist-progress" value={checklistProgress} max={checklistItems.length} aria-label="Daily safety checklist progress" />
            <div className="checklist-items">
              {checklistItems.map((item) => (
                <label className="checklist-item" key={item.id}>
                  <input type="checkbox" checked={Boolean(checklist[item.id])} onChange={() => toggleChecklistItem(item.id)} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <p className="muted-copy">Your progress is saved on this device and resets each day.</p>
          </article>
        </section>

        <section id="causes" className="info-section">
          <div className="section-heading">
            <p className="eyebrow">What causes haze?</p>
            <h2>It forms when pollution builds up in the air.</h2>
          </div>

          <div className="card-grid">
            {causes.map((cause, index) => (
              <article key={cause} className="info-card">
                <span className="card-number">0{index + 1}</span>
                <p>{cause}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="resource-strip" aria-label="Trusted health resources">
          <div>
            <p className="eyebrow">Trusted sources</p>
            <h2>Get local, official health advice.</h2>
          </div>
          <div className="resource-links">
            <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noreferrer">AirNow AQI basics <span aria-hidden="true">↗</span></a>
            <a href="https://www.who.int/health-topics/air-pollution" target="_blank" rel="noreferrer">WHO air pollution <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section id="symptoms" className="symptom-layout">
          <div className="info-panel">
            <div className="section-heading left">
              <p className="eyebrow">Watch for symptoms</p>
              <h2>Exposure can affect the body quickly.</h2>
            </div>

            <div className="badge-list">
              {symptoms.map((symptom) => (
                <span key={symptom} className="badge">
                  {symptom}
                </span>
              ))}
            </div>
            <p className="urgent-note">Seek urgent medical help for severe breathing difficulty, chest pain, or symptoms that worsen quickly.</p>
          </div>

          <div id="tips" className="info-panel accent-panel">
            <div className="section-heading left">
              <p className="eyebrow">Stay safer</p>
              <h2>Simple steps can lower your risk.</h2>
            </div>

            <ol className="tip-list">
              {preventionTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <p className="eyebrow">Act early</p>
            <h2>When haze is heavy, protect people most at risk.</h2>
          </div>
          <a href="#tips" className="primary-btn">
            Get safety guidance
          </a>
        </section>
      </main>
    </div>
  )
}

export default App
