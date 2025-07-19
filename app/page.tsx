"use client"

import { useState, useEffect } from "react"
import { Search, Play, Star, Clock, TrendingUp, Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimeCard } from "@/components/anime-card"
import { LoadingSkeleton, SearchSkeleton } from "@/components/loading-skeleton"
import { useAnimeData } from "@/hooks/use-anime-data"

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          show: () => void
          hide: () => void
          setText: (text: string) => void
          onClick: (callback: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
        }
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void
        }
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
      }
    }
  }
}

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

export default function TelegramAnimeApp() {
  const [currentView, setCurrentView] = useState<"home" | "anime" | "player">("home")
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Anime[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("trending")

  // Use real anime data
  const { trending, seasonal, loading, error, searchAnime, getAnimeDetails } = useAnimeData()

  // Telegram Web App initialization
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()

      // Set user info
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
      }

      // Apply Telegram theme
      const theme = tg.themeParams
      if (theme) {
        document.documentElement.style.setProperty("--tg-bg-color", theme.bg_color || "#ffffff")
        document.documentElement.style.setProperty("--tg-text-color", theme.text_color || "#000000")
        document.documentElement.style.setProperty("--tg-hint-color", theme.hint_color || "#999999")
        document.documentElement.style.setProperty("--tg-link-color", theme.link_color || "#2481cc")
        document.documentElement.style.setProperty("--tg-button-color", theme.button_color || "#2481cc")
        document.documentElement.style.setProperty("--tg-button-text-color", theme.button_text_color || "#ffffff")
      }

      // Setup main button
      tg.MainButton.setText("🎬 Ko'rish")
      tg.MainButton.show()
      tg.MainButton.onClick(() => {
        if (selectedAnime) {
          setCurrentView("player")
          tg.HapticFeedback?.impactOccurred("medium")
        }
      })

      // Setup back button
      tg.BackButton.onClick(() => {
        if (currentView === "player") {
          setCurrentView("anime")
        } else if (currentView === "anime") {
          setCurrentView("home")
        }
      })
    }
  }, [currentView, selectedAnime])

  // Update back button visibility
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      if (currentView === "home") {
        tg.BackButton.hide()
      } else {
        tg.BackButton.show()
      }
    }
  }, [currentView])

  // Search functionality
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const results = await searchAnime(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error("Search error:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, searchAnime])

  const handleAnimeSelect = async (anime: Anime) => {
    setSelectedAnime(anime)
    setCurrentView("anime")
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")

    // Try to get more detailed info
    try {
      const detailedAnime = await getAnimeDetails(anime.id)
      if (detailedAnime) {
        setSelectedAnime(detailedAnime)
      }
    } catch (error) {
      console.error("Error getting anime details:", error)
    }
  }

  const handleFavorite = (animeId: number) => {
    setFavorites((prev) => (prev.includes(animeId) ? prev.filter((id) => id !== animeId) : [...prev, animeId]))
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")
  }

  // Get current anime list based on active tab and search
  const getCurrentAnimeList = () => {
    if (searchQuery.trim()) {
      return searchResults
    }

    switch (activeTab) {
      case "trending":
        return trending
      case "seasonal":
        return seasonal
      case "favorites":
        return [...trending, ...seasonal].filter((anime) => favorites.includes(anime.id))
      default:
        return trending
    }
  }

  // Player View
  if (currentView === "player" && selectedAnime) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-lg p-6 text-center">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{selectedAnime.title}</h2>
          <p className="text-gray-400 mb-6">Video player bu yerda bo'ladi</p>
          <div className="space-y-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setCurrentView("anime")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Anime Detail View
  if (currentView === "anime" && selectedAnime) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--tg-bg-color, #ffffff)" }}>
        <div className="p-4 space-y-4">
          {/* Anime Header */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600">
                <img
                  src={selectedAnime.image || "/placeholder.svg"}
                  alt={selectedAnime.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedAnime.title}</h1>
                  <div className="flex items-center space-x-4 text-white/80 text-sm">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {selectedAnime.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedAnime.episodes} eps
                    </span>
                    <span>{selectedAnime.year}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2" style={{ color: "var(--tg-text-color, #000000)" }}>
                Tavsif
              </h3>
              <p className="text-sm" style={{ color: "var(--tg-hint-color, #999999)" }}>
                {selectedAnime.description}
              </p>
            </CardContent>
          </Card>

          {/* Genres */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3" style={{ color: "var(--tg-text-color, #000000)" }}>
                Janrlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedAnime.genre.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    style={{
                      borderColor: "var(--tg-link-color, #2481cc)",
                      color: "var(--tg-link-color, #2481cc)",
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3 pb-6">
            <Button
              className="w-full"
              style={{
                backgroundColor: "var(--tg-button-color, #2481cc)",
                color: "var(--tg-button-text-color, #ffffff)",
              }}
              onClick={() => setCurrentView("player")}
            >
              <Play className="w-4 h-4 mr-2" />
              Ko'rishni Boshlash
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleFavorite(selectedAnime.id)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${favorites.includes(selectedAnime.id) ? "fill-current text-red-500" : ""}`}
              />
              {favorites.includes(selectedAnime.id) ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Home View
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--tg-bg-color, #ffffff)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 p-4 border-b"
        style={{
          backgroundColor: "var(--tg-bg-color, #ffffff)",
          borderColor: "var(--tg-hint-color, #999999)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--tg-text-color, #000000)" }}>
              🎬 AnimeStream
            </h1>
            {user && (
              <p className="text-sm" style={{ color: "var(--tg-hint-color, #999999)" }}>
                Salom, {user.first_name}!
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--tg-hint-color, #999999)" }}
          />
          <Input
            placeholder="Anime qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{
              backgroundColor: "var(--tg-secondary-bg-color, #f0f0f0)",
              borderColor: "var(--tg-hint-color, #999999)",
              color: "var(--tg-text-color, #000000)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Show search results if searching */}
        {searchQuery.trim() ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: "var(--tg-text-color, #000000)" }}>
              Qidiruv natijalari: "{searchQuery}"
            </h3>
            {isSearching ? (
              <SearchSkeleton />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} onClick={handleAnimeSelect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: "var(--tg-hint-color, #999999)" }}>Hech narsa topilmadi</p>
              </div>
            )}
          </div>
        ) : (
          /* Show tabs if not searching */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-1" />
                Mashhur
              </TabsTrigger>
              <TabsTrigger value="seasonal">
                <Clock className="w-4 h-4 mr-1" />
                Mavsumiy
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="w-4 h-4 mr-1" />
                Sevimli
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Qayta yuklash</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {trending.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} onClick={handleAnimeSelect} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {seasonal.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} onClick={handleAnimeSelect} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--tg-hint-color, #999999)" }} />
                  <p style={{ color: "var(--tg-hint-color, #999999)" }}>Hali sevimli animeler yo'q</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {getCurrentAnimeList().map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} onClick={handleAnimeSelect} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
