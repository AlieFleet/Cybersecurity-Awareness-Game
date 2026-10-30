import { useState } from 'react'
import {
  AqiCard,
  Footer,
  Header,
  HealthTips,
  RegionSelector,
} from './components/HazeComponents'
import { TipsCarousel } from './components/TipsCarousel'
import { HazeQuiz } from './components/HazeQuiz'
import {
  AirQualityInfo,
  AirQualityMap,
  AirQualityTable,
  AqiTrend,
  DailyRanking,
} from './components/AirQualitySections'
import { aqiLevels } from './data/aqiLevels'
import { regions } from './data/regions'
import { useAllRegionsAirQuality } from './hooks/useAllRegionsAirQuality'
import { useCityAirQuality } from './hooks/useCityAirQuality'

// This component loads live air-quality readings and brings the page together.
function App() {
  const [selectedRegion, setSelectedRegion] = useState(() => {
    const savedRegionId = window.localStorage.getItem('haze-selected-region')
    return regions.find((region) => region.id === savedRegionId)
      || regions.find((region) => region.id === 'kuala-lumpur')
  })
  const [trendRegionId, setTrendRegionId] = useState(() => selectedRegion.id)
  const [searchedCity, setSearchedCity] = useState(null)
  const { data, loading, error, refetch } = useAllRegionsAirQuality(regions)
  const {
    reading: cityReading,
    loading: cityLoading,
    error: cityError,
    refetch: refetchCity,
  } = useCityAirQuality(searchedCity)
  const selectedReading = data.find(({ region }) => region.id === selectedRegion.id)
  const trendReading = data.find(({ region }) => region.id === trendRegionId)
  const currentReading = searchedCity ? cityReading : selectedReading
  const currentLocation = searchedCity || selectedRegion
  const currentError = searchedCity ? cityError : error
  const currentLoading = searchedCity ? cityLoading : loading
  const airQuality = currentReading
    ? {
      ...currentReading.current,
      units: currentReading.current_units,
    }
    : null
  const aqi = airQuality?.us_aqi
  const level = Number.isFinite(aqi)
    ? aqiLevels.find((item) => aqi <= item.max)
    : null

  function handleRegionChange(regionId) {
    const region = regions.find((item) => item.id === regionId)
    if (!region) return
    window.localStorage.setItem('haze-selected-region', region.id)
    setSelectedRegion(region)
    setTrendRegionId(region.id)
    setSearchedCity(null)
  }

  return (
    <>
      <div className="haze-page min-h-screen">
        <Header />

        <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
          <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                Malaysia · Air quality
              </p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-normal tracking-tight text-[#173b34] sm:text-5xl">
                Breathe easier with a clearer picture.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Check the latest particulate matter and air quality index readings for all 13 states and 3 federal territories.
              </p>
            </div>

            <RegionSelector
              regions={regions}
              selectedRegion={selectedRegion}
              onRegionChange={handleRegionChange}
              onRefresh={refetch}
              loading={loading}
              selectedCity={searchedCity}
              onSelectCity={setSearchedCity}
              onClearCity={() => setSearchedCity(null)}
              onRefreshCity={refetchCity}
              cityLoading={cityLoading}
            />
          </section>

          <section className="mt-8" aria-live="polite">
            {currentError && (
              <div className="alert alert-error flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{currentError}</span>
                <button type="button" className="btn btn-sm" onClick={searchedCity ? refetchCity : refetch}>
                  Try again
                </button>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <AqiCard
                region={currentLocation.name}
                aqi={aqi}
                level={level}
                airQuality={airQuality}
                loading={currentLoading}
                error={currentError}
              />
              <HealthTips level={level} loading={currentLoading} />
            </div>
          </section>

          <AirQualityMap data={data} loading={loading} />
          <AirQualityTable data={data} loading={loading} />
          <DailyRanking data={data} loading={loading} />
          <AqiTrend
            reading={trendReading}
            regions={regions}
            selectedRegionId={trendRegionId}
            onRegionChange={setTrendRegionId}
            loading={loading}
          />
          <HazeQuiz />
          <AirQualityInfo />

          <section className="mt-12" aria-labelledby="about-haze-title">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Understand the conditions
              </p>
              <h2 id="about-haze-title" className="mt-2 text-2xl font-semibold text-[#173b34]">
                About haze
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Haze in the region is often linked to smoke from forest and peat fires. During dry
                southwest monsoon months, smoke can travel across borders and affect air quality
                in neighboring countries.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-[#173b34]">Why PM2.5 matters</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  PM2.5 describes particles small enough to travel deep into the lungs. Following
                  particle levels can help you make informed decisions about time outdoors.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-[#173b34]">US AQI and Malaysia’s API</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The bands on this page use the US Air Quality Index. Malaysia’s Department of
                  Environment reports its own Air Pollutant Index (API) using different bands, so
                  the numbers may not match.
                </p>
              </article>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Readings are provided by Open-Meteo and may be delayed. For official readings and
              local advisories, check the Malaysian Department of Environment.
            </p>

            <div className="mt-8">
              <TipsCarousel />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

export default App
