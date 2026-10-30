import { useEffect, useState } from 'react'

export function useAllRegionsAirQuality(regions) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchAirQuality() {
      setLoading(true)
      setError('')
      setData([])

      const params = new URLSearchParams({
        latitude: regions.map((region) => region.latitude).join(','),
        longitude: regions.map((region) => region.longitude).join(','),
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
        const locations = Array.isArray(result) ? result : [result]

        if (locations.length !== regions.length) {
          throw new Error('The air-quality service did not return readings for every state and territory.')
        }

        const readings = locations.map((location, index) => {
          if (!location.current || !location.hourly) {
            throw new Error(`The air-quality service did not return complete readings for ${regions[index].name}.`)
          }

          return {
            region: regions[index],
            current: location.current,
            current_units: location.current_units,
            hourly: location.hourly,
          }
        })

        setData(readings)
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'We could not load air-quality readings. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchAirQuality()
    return () => controller.abort()
  }, [regions, requestKey])

  return {
    data,
    loading,
    error,
    refetch: () => setRequestKey((previous) => previous + 1),
  }
}
