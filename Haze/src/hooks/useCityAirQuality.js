import { useEffect, useState } from 'react'

// This hook loads current and hourly air quality for one searched city.
export function useCityAirQuality(city) {
  const [reading, setReading] = useState(null)
  const [loading, setLoading] = useState(Boolean(city))
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    if (!city) {
      return undefined
    }

    const controller = new AbortController()

    async function fetchCityAirQuality() {
      setLoading(true)
      setError('')
      setReading(null)
      const params = new URLSearchParams({
        latitude: String(city.latitude),
        longitude: String(city.longitude),
        current: 'pm2_5,pm10,us_aqi',
        hourly: 'us_aqi',
        past_days: '1',
        forecast_days: '1',
        timezone: 'auto',
      })

      try {
        const response = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          throw new Error(`The air-quality service returned an error (${response.status}).`)
        }

        const result = await response.json()
        if (!result.current || !result.hourly) {
          throw new Error(`The air-quality service did not return complete readings for ${city.name}.`)
        }
        setReading({
          region: city,
          current: result.current,
          current_units: result.current_units,
          hourly: result.hourly,
        })
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'We could not load air-quality readings. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchCityAirQuality()
    return () => controller.abort()
  }, [city, requestKey])

  return {
    reading,
    loading,
    error,
    refetch: () => setRequestKey((previous) => previous + 1),
  }
}
