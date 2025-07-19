// Jikan API - MyAnimeList ma'lumotlari (BEPUL)
export interface AnimeData {
  mal_id: number
  title: string
  synopsis: string
  score: number
  episodes: number
  status: string
  genres: Array<{ name: string }>
  images: {
    jpg: {
      large_image_url: string
    }
  }
  year: number
  duration: string
  rating: string
}

export class JikanAPI {
  private baseUrl = "https://api.jikan.moe/v4"
  private cache = new Map()

  async searchAnime(query: string): Promise<AnimeData[]> {
    const cacheKey = `search_${query}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/anime?q=${encodeURIComponent(query)}&limit=20&order_by=score&sort=desc`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const results = data.data || []

      this.cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error("Search anime error:", error)
      return []
    }
  }

  async getTrendingAnime(): Promise<AnimeData[]> {
    const cacheKey = "trending"
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseUrl}/top/anime?limit=20&filter=airing`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const results = data.data || []

      this.cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error("Get trending anime error:", error)
      return []
    }
  }

  async getAnimeDetails(id: number): Promise<AnimeData | null> {
    const cacheKey = `details_${id}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(`${this.baseUrl}/anime/${id}/full`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const result = data.data

      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error("Get anime details error:", error)
      return null
    }
  }

  async getSeasonalAnime(): Promise<AnimeData[]> {
    const cacheKey = "seasonal"
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      let season = "winter"

      if (currentMonth >= 3 && currentMonth <= 5) season = "spring"
      else if (currentMonth >= 6 && currentMonth <= 8) season = "summer"
      else if (currentMonth >= 9 && currentMonth <= 11) season = "fall"

      const response = await fetch(`${this.baseUrl}/seasons/${currentYear}/${season}?limit=20`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const results = data.data || []

      this.cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error("Get seasonal anime error:", error)
      return []
    }
  }
}

// Transform Jikan data to our format
export function transformAnimeData(jikanData: AnimeData) {
  return {
    id: jikanData.mal_id,
    title: jikanData.title,
    description: jikanData.synopsis || "Tavsif mavjud emas",
    rating: jikanData.score || 0,
    episodes: jikanData.episodes || 0,
    status: jikanData.status === "Currently Airing" ? "ongoing" : "completed",
    genre: jikanData.genres?.map((g) => g.name) || [],
    image: jikanData.images?.jpg?.large_image_url || "/placeholder.svg",
    year: jikanData.year || new Date().getFullYear(),
    duration: jikanData.duration || "24 min",
    ageRating: jikanData.rating || "PG-13",
  }
}
