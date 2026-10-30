import { useEffect, useState } from 'react'

// This constant names the browser storage slot for searched cities.
const SEARCH_HISTORY_KEY = 'haze-city-search-history'

// This component searches Malaysian cities and keeps removable local history.
export function CitySearch({ selectedCity, onSelectCity, onClearCity, onRefresh, loading }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState(() => {
    const saved = window.localStorage.getItem(SEARCH_HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  // This effect searches Open-Meteo after the user pauses typing.
  useEffect(() => {
    if (query.trim().length < 2) return undefined

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      setError('')
      const params = new URLSearchParams({
        name: query.trim(),
        count: '10',
        language: 'en',
        format: 'json',
        countryCode: 'MY',
      })
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?${params}`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          throw new Error(`City search returned an error (${response.status}).`)
        }
        const searchData = await response.json()
        setResults((searchData.results || [])
          .filter((location) => location.feature_code?.startsWith('PPL'))
          .map((location) => ({
            id: `city-${location.id}`,
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            capital: location.admin1 || 'Malaysia',
            group: 'Searched city',
          })))
      } catch (searchError) {
        if (searchError.name !== 'AbortError') {
          setError(searchError.message || 'Could not search Malaysian cities. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function selectCity(city) {
    const nextHistory = [
      city,
      ...history.filter((item) => item.id !== city.id),
    ].slice(0, 10)
    setHistory(nextHistory)
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory))
    onSelectCity(city)
    setQuery('')
    setResults([])
    setError('')
  }

  function deleteHistoryEntry(cityId) {
    const nextHistory = history.filter((city) => city.id !== cityId)
    setHistory(nextHistory)
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory))
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <label htmlFor="city-search" className="mb-1 block text-sm font-semibold text-slate-700">
        Or search for a city
      </label>
      <input
        id="city-search"
        type="search"
        className="input input-bordered w-full rounded-xl border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
        placeholder="Search a Malaysian city or town"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setResults([])
          setError('')
          if (nextQuery.trim().length < 2) {
            setSearching(false)
          } else {
            setSearching(true)
          }
        }}
      />
      {selectedCity && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm">
          <span className="text-emerald-900">Checking AQI for <strong>{selectedCity.name}</strong></span>
          <button type="button" className="btn btn-ghost btn-xs text-emerald-900" onClick={onClearCity}>
            Use selected state
          </button>
        </div>
      )}
      {query.trim().length >= 2 && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {searching && <p className="p-3 text-sm text-slate-500">Searching Malaysian cities…</p>}
          {error && <p className="p-3 text-sm text-red-700" role="alert">{error}</p>}
          {!searching && !error && results.length === 0 && (
            <p className="p-3 text-sm text-slate-500">No city results. Try another search.</p>
          )}
          {results.map((city) => (
            <button
              key={city.id}
              type="button"
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-800 last:border-0 hover:bg-emerald-50"
              onClick={() => selectCity(city)}
            >
              <span className="block font-medium">{city.name}</span>
              <span className="text-xs text-slate-500">{city.capital}</span>
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent city searches</p>
          <ul className="space-y-2">
            {history.map((city) => (
              <li key={city.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium text-emerald-800 hover:underline"
                  onClick={() => selectCity(city)}
                >
                  {city.name}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-slate-600"
                  aria-label={`Delete ${city.name} from search history`}
                  onClick={() => deleteHistoryEntry(city.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedCity && (
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4 w-full border-emerald-800 text-emerald-800 hover:bg-emerald-800 hover:text-white"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Updating city AQI…' : 'Refresh city AQI'}
        </button>
      )}
    </div>
  )
}
