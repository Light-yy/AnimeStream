"use client"

import { useState, useEffect } from "react"

interface Anime {
  id: number
  title: string
  description: string
  rating: number
  episodes: number
  status: string
  genre: string[]
  image: string
  year: number
  duration: string
  ageRating: string
}

export function useAnimeData() {
  const [trending, setTrending] = useState<Anime[]>([])
  const [seasonal, setSeasonal] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load trending and seasonal anime in parallel
      const [trendingResponse, seasonalResponse] = await Promise.all([
        fetch("/api/anime?type=trending"),
        fetch("/api/anime?type=seasonal"),
      ])

      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json()
        setTrending(trendingData)
      }

      if (seasonalResponse.ok) {
        const seasonalData = await seasonalResponse.json()
        setSeasonal(seasonalData)
      }
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi")
      console.error("Load initial data error:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchAnime = async (query: string): Promise<Anime[]> => {
    try {
      if (!query.trim()) return []

      const response = await fetch(`/api/anime?type=search&q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error("Search anime error:", err)
      return []
    }
  }

  const getAnimeDetails = async (id: number): Promise<Anime | null> => {
    try {
      const response = await fetch(`/api/anime?type=details&id=${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error("Get anime details error:", err)
      return null
    }
  }

  return {
    trending,
    seasonal,
    loading,
    error,
    searchAnime,
    getAnimeDetails,
    refetch: loadInitialData,
  }
}
