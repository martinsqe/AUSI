import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function useFetch(url, params = {}) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const key = url + JSON.stringify(params)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    setError(null)
    api.get(url, { params })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [key])

  return { data, loading, error }
}
