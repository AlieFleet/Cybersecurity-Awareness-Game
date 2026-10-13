import { useEffect, useState } from 'react'
import './App.css'

type City = {
  name: string
  state: string
  lat: number
  lon: number
}

type Pollutant = 'us_aqi' | 'pm2_5' | 'pm10' | 'ozone' | 'nitrogen_dioxide' | 'sulphur_dioxide' | 'carbon_monoxide'

type AirQualityResponse = {
  current: {
    time: string
    us_aqi: number | null
    pm2_5: number | null
    pm10: number | null
    ozone: number | null
    nitrogen_dioxide: number | null
    sulphur_dioxide: number | null
    carbon_monoxide: number | null
  }
  hourly: {
    time: string[]
    pm2_5: (number | null)[]
  }
}

type CityReading = {
  city: City
  current: AirQualityResponse['current']
  hourly: AirQualityResponse['hourly']
}

type AqiCategory = {
  label: string
  badgeClass: string
  advice: string
}

const CITIES: City[] = [
  { name: 'Kota Bharu', state: 'Kelantan', lat: 6.1256, lon: 102.2381 },
  { name: 'Kuala Lumpur', state: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
  { name: 'Shah Alam', state: 'Selangor', lat: 3.0733, lon: 101.5185 },
  { name: 'George Town', state: 'Penang', lat: 5.4141, lon: 100.3288 },
  { name: 'Ipoh', state: 'Perak', lat: 4.5975, lon: 101.0901 },
  { name: 'Johor Bahru', state: 'Johor', lat: 1.4927, lon: 103.7414 },
  { name: 'Melaka', state: 'Melaka', lat: 2.1896, lon: 102.2501 },
  { name: 'Kuantan', state: 'Pahang', lat: 3.8077, lon: 103.326 },
  { name: 'Kuala Terengganu', state: 'Terengganu', lat: 5.3302, lon: 103.1408 },
  { name: 'Alor Setar', state: 'Kedah', lat: 6.1248, lon: 100.3678 },
  { name: 'Kuching', state: 'Sarawak', lat: 1.5533, lon: 110.3592 },
  { name: 'Kota Kinabalu', state: 'Sabah', lat: 5.9804, lon: 116.0735 },
]

const POLLUTANTS: { key: Pollutant; label: string; unit: string }[] = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
  { key: 'ozone', label: 'Ozone', unit: 'µg/m³' },
  { key: 'nitrogen_dioxide', label: 'Nitrogen dioxide', unit: 'µg/m³' },
  { key: 'sulphur_dioxide', label: 'Sulphur dioxide', unit: 'µg/m³' },
  { key: 'carbon_monoxide', label: 'Carbon monoxide', unit: 'µg/m³' },
]

function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) {
    return { label: 'Good', badgeClass: 'aqi-good', advice: 'Air quality is good. Enjoy your usual outdoor activities.' }
  }
  if (aqi <= 100) {
    return { label: 'Moderate', badgeClass: 'aqi-moderate', advice: 'Air quality is acceptable. Unusually sensitive people may wish to reduce prolonged outdoor exertion.' }
  }
  if (aqi <= 150) {
    return { label: 'Unhealthy for Sensitive Groups', badgeClass: 'aqi-sensitive', advice: 'Sensitive groups should reduce prolonged outdoor activity and consider wearing a well-fitting mask.' }
  }
  if (aqi <= 200) {
    return { label: 'Unhealthy', badgeClass: 'aqi-unhealthy', advice: 'Wear an N95 mask outdoors, limit outdoor activity, and keep windows closed where possible.' }
  }
  if (aqi <= 300) {
    return { label: 'Very Unhealthy', badgeClass: 'aqi-very-unhealthy', advice: 'Avoid outdoor activity. Stay indoors with windows closed and use an air purifier if available.' }
  }
  return { label: 'Hazardous', badgeClass: 'aqi-hazardous', advice: 'Stay indoors, avoid all outdoor exertion, and follow local public-health guidance.' }
}

function formatValue(value: number | null): string {
  return value === null ? '—' : value.toFixed(1)
}

function getHazeLevel(aqi: number | null): string {
  if (aqi === null) return 'good'
  return getAqiCategory(aqi).badgeClass.replace('aqi-', '')
}

function App() {
  const [readings, setReadings] = useState<CityReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCity, setSelectedCity] = useState('all')
  const [sortOrder, setSortOrder] = useState<'worst' | 'alphabetical'>('worst')
  const [darkTheme, setDarkTheme] = useState(false)

  async function fetchReadings() {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.all(CITIES.map(async (city): Promise<CityReading> => {
        const params = new URLSearchParams({
          latitude: String(city.lat),
          longitude: String(city.lon),
          current: 'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide',
          hourly: 'pm2_5',
          forecast_days: '2',
          timezone: 'auto',
        })
        const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
        if (!response.ok) {
          throw new Error(`Could not load air quality for ${city.name} (HTTP ${response.status}).`)
        }
        const data: AirQualityResponse = await response.json()
        return { city, current: data.current, hourly: data.hourly }
      }))
      setReadings(results)
      setLastUpdated(new Date())
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Air quality data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialFetchId = window.setTimeout(() => void fetchReadings(), 0)
    const intervalId = window.setInterval(() => void fetchReadings(), 10 * 60 * 1000)
    return () => {
      window.clearTimeout(initialFetchId)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light'
  }, [darkTheme])

  const orderedReadings = [...readings].sort((first, second) => {
    if (sortOrder === 'alphabetical') return first.city.name.localeCompare(second.city.name)
    return (second.current.us_aqi ?? -1) - (first.current.us_aqi ?? -1)
  })
  const worstAqi = readings.reduce((worst, reading) => Math.max(worst, reading.current.us_aqi ?? 0), 0)
  const affectedCities = readings.filter((reading) => (reading.current.us_aqi ?? 0) > 100)
  const detailReading = readings.find((reading) => reading.city.name === selectedCity)
  const hazeLevel = getHazeLevel(worstAqi || null)

  function renderCityCard(reading: CityReading) {
    const aqi = reading.current.us_aqi
    const category = aqi === null ? null : getAqiCategory(aqi)
    return (
      <article className="card city-card" key={reading.city.name}>
        <button
          type="button"
          className="city-card-button"
          onClick={() => setSelectedCity(reading.city.name)}
          aria-label={`View ${reading.city.name} details${aqi === null ? '' : `, AQI ${aqi}, ${category?.label}`}`}
        >
          <span className="city-heading">
            <span>
              <span className="city-name">{reading.city.name}</span>
              <span className="city-state">{reading.city.state}</span>
            </span>
            <span className="city-arrow" aria-hidden="true">↗</span>
          </span>
          <span className="city-aqi-row">
            <span className="city-aqi">{aqi ?? '—'}</span>
            {category
              ? <span className={`badge aqi-badge ${category.badgeClass}`}>{category.label}</span>
              : <span className="badge aqi-badge">Unavailable</span>}
          </span>
          <span className="city-particles">
            <span>PM2.5 <strong>{formatValue(reading.current.pm2_5)}</strong> µg/m³</span>
            <span>PM10 <strong>{formatValue(reading.current.pm10)}</strong> µg/m³</span>
          </span>
        </button>
      </article>
    )
  }

  return (
    <main className={`dashboard-shell haze-${hazeLevel}`}>
      <header className="navbar dashboard-header">
        <div className="header-brand">
          <span className="brand-mark" aria-hidden="true">◉</span>
          <div>
            <p className="eyebrow">AIR QUALITY · MALAYSIA</p>
            <h1>Malaysia Haze Monitor</h1>
            <p className="subtitle">A clear view of the air across the country.</p>
          </div>
        </div>
        <div className="header-actions">
          <label className="theme-control">
            <span>Dark theme</span>
            <input
              className="toggle toggle-sm"
              type="checkbox"
              checked={darkTheme}
              onChange={(event) => setDarkTheme(event.target.checked)}
              aria-label="Toggle dark theme"
            />
          </label>
          <button type="button" className="btn btn-primary refresh-button" onClick={() => void fetchReadings()} disabled={loading}>
            <span aria-hidden="true" className={loading ? 'refresh-icon spinning' : 'refresh-icon'}>↻</span>
            {loading ? 'Updating' : 'Refresh'}
          </button>
        </div>
      </header>

      <section className="dashboard-content" aria-label="Malaysia air quality dashboard">
        <div className="update-line">
          <span className="live-dot" aria-hidden="true" />
          <span>Live conditions</span>
          <span className="update-separator" aria-hidden="true">·</span>
          <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'Waiting for data'}</span>
        </div>

        {affectedCities.length > 0 && (
          <div className="alert haze-alert" role="status">
            <span className="alert-icon" aria-hidden="true">!</span>
            <div>
              <strong>Haze advisory · {affectedCities.length} {affectedCities.length === 1 ? 'city' : 'cities'} above AQI 100</strong>
              <p>{affectedCities.map((reading) => `${reading.city.name} (${reading.current.us_aqi})`).join(' · ')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert error-alert" role="alert">
            <div>
              <strong>We couldn't update the air quality data.</strong>
              <p>{error} Please check your connection and try again.</p>
            </div>
            <button type="button" className="btn btn-sm" onClick={() => void fetchReadings()}>Try again</button>
          </div>
        )}

        <section className="overview-section" aria-labelledby="overview-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NATIONWIDE SNAPSHOT</p>
              <h2 id="overview-title">Air quality by city</h2>
            </div>
            <div className="overview-controls">
              <label className="control-label">
                <span>View</span>
                <select
                  className="select select-bordered select-sm"
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  aria-label="Choose a city or view all cities"
                >
                  <option value="all">All cities</option>
                  {CITIES.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
                </select>
              </label>
              <label className="control-label">
                <span>Sort</span>
                <select
                  className="select select-bordered select-sm"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as 'worst' | 'alphabetical')}
                  aria-label="Sort cities"
                >
                  <option value="worst">Worst AQI first</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="city-grid" aria-label="Loading city air quality">
              {CITIES.slice(0, 8).map((city) => (
                <div className="card loading-card" key={city.name} aria-hidden="true">
                  <div className="skeleton skeleton-text loading-title" />
                  <div className="skeleton skeleton-text loading-value" />
                  <div className="skeleton skeleton-text loading-caption" />
                </div>
              ))}
            </div>
          ) : (
            <div className="city-grid">
              {(selectedCity === 'all' ? orderedReadings : orderedReadings.filter((reading) => reading.city.name === selectedCity))
                .map(renderCityCard)}
            </div>
          )}
          {!loading && !error && readings.length > 0 && (
            <p className="card-hint">Select a city card to explore its pollutant details and 24-hour PM2.5 trend.</p>
          )}
        </section>

        {!loading && detailReading && (
          <CityDetail reading={detailReading} />
        )}
      </section>

      <footer className="dashboard-footer">
        <p>Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo Air Quality API</a>.</p>
        <p>This dashboard is for awareness only and is not an official Malaysian DOE reading.</p>
      </footer>
    </main>
  )
}

function CityDetail({ reading }: { reading: CityReading }) {
  const aqi = reading.current.us_aqi
  const category = aqi === null ? null : getAqiCategory(aqi)
  const currentHourIndex = reading.hourly.time.findIndex((time) => time >= reading.current.time)
  const startIndex = currentHourIndex < 0 ? 0 : currentHourIndex
  const trend = reading.hourly.time.slice(startIndex, startIndex + 24).map((time, index) => ({
    time,
    value: reading.hourly.pm2_5[startIndex + index] ?? null,
  }))
  const peak = Math.max(1, ...trend.map((hour) => hour.value ?? 0))

  return (
    <section className="detail-section" aria-labelledby="detail-title">
      <div className="section-heading detail-heading">
        <div>
          <p className="eyebrow">CITY DETAILS · {reading.city.state.toUpperCase()}</p>
          <h2 id="detail-title">{reading.city.name}</h2>
        </div>
        {category && <span className={`badge aqi-badge ${category.badgeClass}`}>{category.label}</span>}
      </div>

      <div className="detail-grid">
        <article className="card detail-card aqi-detail">
          <div className="stat detail-stat">
            <p className="eyebrow stat-title">US AIR QUALITY INDEX</p>
            <div className="aqi-stat-row stat-value">
              <span className="aqi-stat-value">{aqi ?? '—'}</span>
              {category && <span className={`badge aqi-badge ${category.badgeClass}`}>{category.label}</span>}
            </div>
            <p className="health-advice stat-desc">{category?.advice ?? 'The current AQI is unavailable for this location.'}</p>
          </div>
        </article>

        <article className="card detail-card pollutant-card">
          <p className="eyebrow">CURRENT POLLUTANTS</p>
          <dl className="pollutant-grid">
            {POLLUTANTS.map((pollutant) => (
              <div className="pollutant-stat" key={pollutant.key}>
                <dt>{pollutant.label}</dt>
                <dd>{formatValue(reading.current[pollutant.key])} <span>{pollutant.unit}</span></dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="card detail-card trend-card">
        <div className="trend-heading">
          <div>
            <p className="eyebrow">NEXT 24 HOURS</p>
            <h3>PM2.5 forecast</h3>
          </div>
          <span className="trend-unit">µg/m³</span>
        </div>
        <div className="trend-chart" role="img" aria-label={`Hourly PM2.5 forecast for ${reading.city.name} for the next ${trend.length} hours`}>
          {trend.map((hour, index) => (
            <div className="trend-column" key={`${hour.time}-${index}`} title={`${hour.time.replace('T', ' ')} · ${formatValue(hour.value)} µg/m³`}>
              <span
                className="trend-bar"
                style={{ height: `${Math.max(4, ((hour.value ?? 0) / peak) * 100)}%` }}
              />
              <span className="trend-time">{hour.time.slice(11, 16)}</span>
            </div>
          ))}
        </div>
        {trend.length === 0 && <p className="empty-trend">Hourly forecast is not available right now.</p>}
      </article>
    </section>
  )
}

export default App
