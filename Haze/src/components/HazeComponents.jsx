import { CitySearch } from './CitySearch'

// This component introduces haze and explains what the page measures.
export function Header() {
  return (
    <header className="border-b border-emerald-950/10 bg-[#173b34] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-emerald-200" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 4c-7 0-13 3-13 9a6 6 0 0 0 6 6c6 0 7-8 7-15ZM5 21c2-5 5-8 10-11" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">HazeWatch <span className="text-emerald-200">Malaysia</span></p>
            <p className="mt-0.5 text-sm text-emerald-50/75">
              Haze is tiny particles and pollutants in the air that can affect your health.
            </p>
          </div>
        </div>
        <nav aria-label="Page sections" className="flex flex-wrap gap-x-5 gap-y-2 pl-1 text-sm font-medium text-emerald-50/85">
          {[
            ['Map', 'map'],
            ['Table', 'table'],
            ['Ranking', 'ranking'],
            ['Trend', 'trend'],
            ['Quiz', 'quiz'],
            ['Info', 'info'],
          ].map(([label, target]) => (
            <a key={target} className="hover:text-white hover:underline hover:underline-offset-4" href={`#${target}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

// This component lets visitors choose a Malaysian state or federal territory.
export function RegionSelector({
  regions,
  selectedRegion,
  onRegionChange,
  onRefresh,
  loading,
  selectedCity,
  onSelectCity,
  onClearCity,
  onRefreshCity,
  cityLoading,
}) {
  const groups = [...new Set(regions.map((region) => region.group))]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <label htmlFor="region-select" className="mb-2 block text-sm font-semibold text-slate-700">
        Select a state / territory
      </label>
      <select
        id="region-select"
        className="select select-bordered w-full border-slate-300 bg-white text-[#173b34]"
        value={selectedRegion.id}
        onChange={(event) => onRegionChange(event.target.value)}
      >
        {groups.map((group) => (
          <optgroup key={group} label={group}>
            {regions.filter((region) => region.group === group).map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="mt-2 text-xs text-slate-500">Capital: {selectedRegion.capital}</p>
      <CitySearch
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onClearCity={onClearCity}
        onRefresh={onRefreshCity}
        loading={cityLoading}
      />
      <button
        type="button"
        className="btn btn-outline mt-4 w-full border-emerald-800 text-emerald-800 hover:bg-emerald-800 hover:text-white"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? 'Updating readings…' : 'Refresh readings'}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Live particulate matter and US AQI from Open-Meteo.
      </p>
    </div>
  )
}

// This component displays the selected state or territory's AQI and particle readings.
export function AqiCard({ region, aqi, level, airQuality, loading, error }) {
  const readingDate = airQuality?.time
    ? new Date(airQuality.time.endsWith('Z') ? airQuality.time : `${airQuality.time}Z`)
    : null
  const readingTime = readingDate && !Number.isNaN(readingDate.getTime())
    ? new Intl.DateTimeFormat('en-MY', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }).format(readingDate)
    : null

  const stats = [
    {
      label: 'PM2.5',
      value: airQuality?.pm2_5,
      unit: airQuality?.units?.pm2_5 || 'μg/m³',
      note: 'Fine particles',
    },
    {
      label: 'PM10',
      value: airQuality?.pm10,
      unit: airQuality?.units?.pm10 || 'μg/m³',
      note: 'Coarse particles',
    },
  ]

  return (
    <article className="card overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="card-body p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Current conditions</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#173b34]">{region}</h2>
          </div>
          <span className={`badge badge-outline gap-1.5 border-slate-300 px-3 py-3 text-xs font-medium text-slate-600 ${loading ? 'animate-pulse' : ''}`}>
            <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-400' : error ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {loading
              ? 'Updating'
              : error
                ? 'Unavailable'
                : readingTime
                  ? `Updated ${readingTime}`
                  : 'Latest reading'}
          </span>
        </div>

        <div className={`mt-6 rounded-2xl border p-5 sm:p-6 ${level?.panel || 'border-slate-200 bg-slate-50'}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-600">US Air Quality Index</p>
              {loading ? (
                <div className="skeleton mt-2 h-16 w-32 bg-slate-200" aria-label="Loading AQI" />
              ) : (
                <p className={`aqi-number mt-1 text-6xl font-semibold leading-none tracking-tight ${level?.color || 'text-slate-500'}`}>
                  {Number.isFinite(aqi) ? Math.round(aqi) : '—'}
                </p>
              )}
            </div>
            {loading ? (
              <div className="skeleton h-8 w-28 rounded-full bg-slate-200" aria-hidden="true" />
            ) : (
              <span className={`badge ${level?.badge || 'badge-ghost'} px-4 py-3 text-sm font-semibold`}>
                {level?.name || 'No AQI reading'}
              </span>
            )}
          </div>
          <div className="mt-6 grid grid-cols-6 gap-1" aria-label="AQI scale from good to hazardous">
            {['bg-emerald-500', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500', 'bg-purple-600', 'bg-rose-900'].map((color) => (
              <span key={color} className={`h-1.5 rounded-full ${color}`} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
            <span>Good</span>
            <span>Hazardous</span>
          </div>
        </div>

        <div className="stats stats-vertical mt-5 w-full border border-slate-200 bg-white shadow-none sm:stats-horizontal">
          {stats.map((stat) => (
            <div key={stat.label} className="stat px-4 py-4">
              <div className="stat-title text-xs font-semibold text-slate-500">{stat.label}</div>
              <div className="stat-value mt-1 text-2xl font-semibold text-[#173b34]">
                {loading ? '—' : Number.isFinite(stat.value) ? Number(stat.value).toFixed(1) : '—'}
              </div>
              <div className="stat-desc mt-1 text-xs text-slate-500">
                {stat.unit} · {stat.note}
              </div>
            </div>
          ))}
        </div>
        {!loading && !error && !level && (
          <p className="mt-3 text-sm text-slate-500">An AQI reading is not available for this state or territory right now.</p>
        )}
      </div>
    </article>
  )
}

// This component gives practical health advice for the current AQI level.
export function HealthTips({ level, loading }) {
  const tipsByLevel = {
    Good: {
      heading: 'Air quality is good',
      description: 'Enjoy your usual outdoor activities. Keep an eye on conditions if they change.',
      tips: ['A good time to get outside.', 'Check again later for updated readings.'],
      icon: '☀',
    },
    Moderate: {
      heading: 'Generally okay outdoors',
      description: 'Most people can continue their normal activities outside.',
      tips: ['Unusually sensitive people may want to take it easier.', 'Consider reducing prolonged, heavy exertion if you feel symptoms.'],
      icon: '◐',
    },
    'Unhealthy for Sensitive Groups': {
      heading: 'Take extra care if sensitive',
      description: 'Children, older adults, and people with heart or lung conditions may be more affected.',
      tips: ['Reduce prolonged or strenuous outdoor activity.', 'Keep prescribed medication close and watch for symptoms.'],
      icon: '♧',
    },
    Unhealthy: {
      heading: 'Limit time outdoors',
      description: 'Everyone may begin to experience health effects, especially with extended exposure.',
      tips: ['Move strenuous activities indoors or reschedule them.', 'Close windows if outdoor air is making you feel unwell.'],
      icon: '!',
    },
    'Very Unhealthy': {
      heading: 'Protect yourself from exposure',
      description: 'Health alert: reduce outdoor exposure and take symptoms seriously.',
      tips: ['Stay indoors as much as possible and keep windows closed.', 'Use a well-fitting particulate respirator if you must go outside.'],
      icon: '!',
    },
    Hazardous: {
      heading: 'Avoid outdoor exposure',
      description: 'This is a serious health warning. Everyone should take steps to reduce exposure.',
      tips: ['Stay indoors and avoid outdoor physical activity.', 'Follow local health advisories and seek care for severe symptoms.'],
      icon: '!',
    },
  }

  const advice = !loading && level ? tipsByLevel[level.name] : null

  return (
    <aside className="card border border-slate-200 bg-white shadow-sm">
      <div className="card-body gap-4 p-5 sm:gap-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-800" aria-hidden="true">
            {advice?.icon || '♡'}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your health</p>
            <h2 className="mt-1 text-xl font-semibold text-[#173b34]">
              {loading ? 'Getting your local guidance' : advice?.heading || 'Stay informed'}
            </h2>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">
          {loading
            ? 'Health tips will appear once the latest AQI reading is available.'
            : advice?.description || 'Choose a location to see practical guidance for its current air quality.'}
        </p>

        <ul className="space-y-3">
          {(advice?.tips || ['Check local conditions before spending extended time outdoors.', 'If you feel unwell, move to cleaner air and seek medical advice.']).map((tip) => (
            <li key={tip} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
          AQI guidance is general information, not a substitute for medical advice.
        </p>
      </div>
    </aside>
  )
}

// This component links visitors to Malaysia's official air-quality readings.
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>For official readings and local advisories, check the Malaysian Department of Environment.</p>
        <a
          className="inline-flex items-center gap-2 font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
          href="https://eqms.doe.gov.my/APIMS/main"
          target="_blank"
          rel="noreferrer"
        >
          Visit DOE Malaysia
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  )
}
