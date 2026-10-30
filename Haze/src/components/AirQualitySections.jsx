import { useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from 'react-leaflet'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import 'leaflet/dist/leaflet.css'
import { aqiLevels } from '../data/aqiLevels'

function getAqiLevel(aqi) {
  return Number.isFinite(aqi) ? aqiLevels.find((level) => aqi <= level.max) : null
}

function formatNumber(value) {
  return Number.isFinite(value) ? Number(value).toFixed(1) : '—'
}

// This component plots the latest air-quality readings for each region on a Malaysia map.
export function AirQualityMap({ data, loading }) {
  return (
    <section id="map" className="mt-12 scroll-mt-6" aria-labelledby="map-title">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Explore Malaysia</p>
        <h2 id="map-title" className="mt-2 text-2xl font-semibold text-[#173b34]">Air quality map</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <MapContainer
          center={[4.2, 109.5]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-[420px] w-full rounded-xl sm:h-[500px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map(({ region, current }) => {
            const level = getAqiLevel(current.us_aqi)
            if (!level) return null

            return (
              <CircleMarker
                key={region.id}
                center={[region.latitude, region.longitude]}
                radius={18}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: level.hex, fillOpacity: 0.9 }}
              >
                <Tooltip permanent direction="center" className="aqi-map-label">
                  {Math.round(current.us_aqi)}
                </Tooltip>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{region.name}</p>
                    <p>Capital: {region.capital}</p>
                    <p>AQI: {Math.round(current.us_aqi)} · {level.name}</p>
                    <p>PM2.5: {formatNumber(current.pm2_5)} µg/m³</p>
                    <p>PM10: {formatNumber(current.pm10)} µg/m³</p>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 py-3" aria-label="AQI map legend">
          {aqiLevels.map((level) => (
            <span key={level.name} className="inline-flex items-center gap-2 text-xs text-slate-600">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: level.hex }} />
              {level.name}
            </span>
          ))}
        </div>
        {loading && <p className="px-3 pb-3 text-xs text-slate-500">Updating state and territory readings…</p>}
      </div>
    </section>
  )
}

// This component displays state and territory readings in a searchable table.
export function AirQualityTable({ data, loading }) {
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)
  const filteredData = data.filter(({ region }) =>
    `${region.name} ${region.capital}`.toLowerCase().includes(filter.trim().toLowerCase()),
  )
  const visibleData = showAll ? filteredData : filteredData.slice(0, 6)

  return (
    <section id="table" className="mt-12 scroll-mt-6" aria-labelledby="table-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">State / territory details</p>
          <h2 id="table-title" className="mt-2 text-2xl font-semibold text-[#173b34]">State details</h2>
          <p className="mt-2 text-sm text-slate-500">Each state and territory is represented by its capital city's coordinates.</p>
        </div>
        <label className="form-control w-full sm:max-w-xs">
          <span className="mb-1 text-xs font-semibold text-slate-700">Filter by state / territory</span>
          <input
            type="search"
            className="input input-bordered input-sm w-full rounded-xl border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
            placeholder="Search states and territories"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="table w-full text-left text-sm text-slate-700">
          <thead className="bg-emerald-50 text-slate-700">
            <tr>
              <th className="bg-emerald-50 text-slate-700">State</th>
              <th className="bg-emerald-50 text-slate-700">Capital</th>
              <th className="bg-emerald-50 text-slate-700">AQI</th>
              <th className="bg-emerald-50 text-slate-700">Level</th>
              <th className="bg-emerald-50 text-slate-700">PM2.5</th>
              <th className="bg-emerald-50 text-slate-700">PM10</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr><td colSpan="6" className="bg-white py-6 text-center text-slate-600">Loading state and territory readings…</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="6" className="bg-white py-6 text-center text-slate-600">No states or territories match your search.</td></tr>
            ) : visibleData.map(({ region, current }) => {
              const level = getAqiLevel(current.us_aqi)
              return (
                <tr key={region.id} className="odd:bg-white even:bg-slate-50 hover:bg-emerald-50/60">
                  <td className="text-slate-800">{region.name}</td>
                  <td className="text-slate-700">{region.capital}</td>
                  <td className="text-slate-800">{Number.isFinite(current.us_aqi) ? Math.round(current.us_aqi) : '—'}</td>
                  <td>
                    {level
                      ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${level.badge}`}>{level.name}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="text-slate-700">{formatNumber(current.pm2_5)}</td>
                  <td className="text-slate-700">{formatNumber(current.pm10)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {filteredData.length > 6 && (
        <button
          type="button"
          className="btn btn-outline btn-sm mt-3 border-emerald-800 text-emerald-800 hover:bg-emerald-800 hover:text-white"
          aria-expanded={showAll}
          onClick={() => setShowAll((expanded) => !expanded)}
        >
          {showAll ? 'Show fewer states' : `Show all ${filteredData.length} states and territories`}
        </button>
      )}
    </section>
  )
}

// This component ranks all regions from cleanest to most polluted or the reverse.
export function DailyRanking({ data, loading }) {
  const [direction, setDirection] = useState('polluted')
  const sortedData = useMemo(() => [...data].sort((first, second) => {
    const firstAqi = first.current.us_aqi
    const secondAqi = second.current.us_aqi
    if (!Number.isFinite(firstAqi) && !Number.isFinite(secondAqi)) return 0
    if (!Number.isFinite(firstAqi)) return 1
    if (!Number.isFinite(secondAqi)) return -1
    return (firstAqi - secondAqi) * (direction === 'cleanest' ? 1 : -1)
  }), [data, direction])

  return (
    <section id="ranking" className="mt-12 scroll-mt-6" aria-labelledby="ranking-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Daily comparison</p>
          <h2 id="ranking-title" className="mt-2 text-2xl font-semibold text-[#173b34]">State / territory ranking</h2>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1" role="group" aria-label="Ranking order">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${direction === 'cleanest' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
            aria-pressed={direction === 'cleanest'}
            onClick={() => setDirection('cleanest')}
          >
            Cleanest first
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${direction === 'polluted' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
            aria-pressed={direction === 'polluted'}
            onClick={() => setDirection('polluted')}
          >
            Most polluted first
          </button>
        </div>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {loading && data.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading state and territory ranking…</li>
        ) : sortedData.map(({ region, current }, index) => {
          const level = getAqiLevel(current.us_aqi)
          return (
            <li key={region.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-[#173b34]">{region.name}</span>
              {level
                ? <span className={`badge ${level.badge}`}>{Math.round(current.us_aqi)} · {level.name}</span>
                : <span className="badge badge-ghost">No AQI</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function formatHour(value) {
  const hour = Number(value.slice(11, 13))
  if (!Number.isFinite(hour)) return value
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12} ${suffix}`
}

// This component charts the selected region's recent hourly AQI and direction.
export function AqiTrend({ reading, regions, selectedRegionId, onRegionChange, loading }) {
  const chartData = useMemo(() => {
    const times = reading?.hourly?.time || []
    const values = reading?.hourly?.us_aqi || []
    const endTime = reading?.current?.time
    if (!endTime) return []

    const end = Date.parse(`${endTime}Z`)
    if (!Number.isFinite(end)) return []

    return times
      .map((time, index) => ({
        time,
        timestamp: Date.parse(`${time}Z`),
        aqi: values[index],
      }))
      .filter((point) =>
        Number.isFinite(point.timestamp)
        && point.timestamp >= end - 24 * 60 * 60 * 1000
        && point.timestamp <= end
        && Number.isFinite(point.aqi),
      )
      .map(({ time, aqi }) => ({ time, aqi: Math.round(aqi) }))
  }, [reading])
  const trend = chartData.length > 1
    ? chartData.at(-1).aqi - chartData[0].aqi
    : null
  const trendText = trend === null
    ? 'There is not enough hourly data to determine a trend.'
    : trend > 1
      ? 'AQI is rising over the past 24 hours.'
      : trend < -1
        ? 'AQI is falling over the past 24 hours.'
        : 'AQI has been stable over the past 24 hours.'
  const selectedRegion = regions.find((region) => region.id === selectedRegionId)
  const regionGroups = [...new Set(regions.map((region) => region.group))]
  const latestLevel = getAqiLevel(reading?.current?.us_aqi)

  return (
    <section id="trend" className="mt-12 scroll-mt-6" aria-labelledby="trend-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Recent conditions</p>
          <h2 id="trend-title" className="mt-2 text-2xl font-semibold text-[#173b34]">
            24-hour AQI trend: {selectedRegion?.name || 'Malaysia'}
          </h2>
        </div>
        <label className="form-control w-full sm:max-w-xs">
          <span className="mb-1 text-xs font-semibold text-slate-700">Choose a state / territory</span>
          <select
            className="select select-bordered w-full rounded-xl border-slate-300 bg-white text-slate-800"
            value={selectedRegionId}
            onChange={(event) => onRegionChange(event.target.value)}
          >
            {regionGroups.map((group) => (
              <optgroup key={group} label={group}>
                {regions.filter((region) => region.group === group).map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {loading && chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading hourly trend…</p>
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">Hourly AQI data is not available for this state or territory.</p>
        ) : (
          <div className="h-72 w-full" aria-label="Line chart of hourly AQI during the past 24 hours">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tickFormatter={formatHour} minTickGap={28} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} width={44} tick={{ fill: '#64748b', fontSize: 12 }} />
                <ChartTooltip
                  labelFormatter={(label) => `${label.slice(11, 16)} local time`}
                  formatter={(value) => [`${value} AQI`, 'US AQI']}
                />
                <Line type="monotone" dataKey="aqi" stroke={latestLevel?.hex || '#15803d'} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-3 text-sm font-medium text-slate-600">{trendText}</p>
      </div>
    </section>
  )
}

// This component explains the page's AQI, particle, and data terms in a compact accordion.
export function AirQualityInfo() {
  return (
    <section id="info" className="mt-12 scroll-mt-6" aria-labelledby="info-title">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Learn the terms</p>
        <h2 id="info-title" className="mt-2 text-2xl font-semibold text-[#173b34]">Air quality glossary</h2>
      </div>
      <div className="collapse collapse-arrow rounded-2xl border border-slate-200 bg-white shadow-sm">
        <input type="checkbox" aria-label="Expand air quality glossary" />
        <div className="collapse-title font-semibold text-[#173b34]">
          AQI, particle measurements, levels, and data sources
        </div>
        <div className="collapse-content space-y-4 text-sm leading-6 text-slate-600">
          <p><strong className="text-slate-800">AQI:</strong> The Air Quality Index summarizes air pollution levels and potential health concern.</p>
          <p><strong className="text-slate-800">US AQI vs Malaysia’s API:</strong> This page uses US AQI categories. Malaysia’s Department of Environment publishes its own Air Pollutant Index (API), with different calculations and bands, so values are not directly interchangeable.</p>
          <p><strong className="text-slate-800">PM2.5:</strong> Fine particles with a diameter of 2.5 micrometres or smaller that can travel deep into the lungs.</p>
          <p><strong className="text-slate-800">PM10:</strong> Particles with a diameter of 10 micrometres or smaller, including dust and larger smoke particles.</p>
          <p><strong className="text-slate-800">µg/m³:</strong> Micrograms per cubic metre, the concentration unit used for particulate matter.</p>
          <div>
            <p className="mb-2 font-semibold text-slate-800">US AQI levels</p>
            <ul className="space-y-2">
              {aqiLevels.map((level) => (
                <li key={level.name} className="flex flex-wrap items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: level.hex }} />
                  <span className="font-medium text-slate-800">{level.name}</span>
                  <span>{level.min}–{Number.isFinite(level.max) ? level.max : '500+'}</span>
                </li>
              ))}
            </ul>
          </div>
          <p>
  <strong className="text-slate-800">Data source:</strong> Readings are
  modelled estimates from Open-Meteo, not direct measurements from Malaysian
  DOE monitoring stations. The DOE publishes its official Air Pollutant Index
  (API) through its own website and mobile app, but we could not find a public
  data feed that websites like this one can connect to. For official station
  readings and advisories, visit the{' '}
  <a
    href="https://eqms.doe.gov.my/APIMS/main"
    target="_blank"
    rel="noreferrer"
    className="link link-primary font-medium"
  >
    DOE APIMS portal
  </a>
  .
</p>
        </div>
      </div>
    </section>
  )
}
