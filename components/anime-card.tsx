"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Calendar } from "lucide-react"

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

interface AnimeCardProps {
  anime: Anime
  onClick: (anime: Anime) => void
}

export function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
      onClick={() => onClick(anime)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={anime.image || "/placeholder.svg"}
            alt={anime.title}
            className="w-full h-40 object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=160&width=120"
            }}
          />

          {/* Rating Badge */}
          {anime.rating > 0 && (
            <Badge className="absolute top-2 right-2 bg-yellow-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              {anime.rating.toFixed(1)}
            </Badge>
          )}

          {/* Status Badge */}
          <Badge
            className={`absolute top-2 left-2 text-xs ${
              anime.status === "ongoing" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {anime.status === "ongoing" ? "Davom etmoqda" : "Tugagan"}
          </Badge>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-3 space-y-2">
          <h4
            className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]"
            style={{ color: "var(--tg-text-color, #000000)" }}
            title={anime.title}
          >
            {anime.title}
          </h4>

          <div className="flex items-center justify-between text-xs" style={{ color: "var(--tg-hint-color, #999999)" }}>
            <div className="flex items-center space-x-2">
              {anime.episodes > 0 && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {anime.episodes} eps
                </span>
              )}

              {anime.year && (
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {anime.year}
                </span>
              )}
            </div>
          </div>

          {/* Genres */}
          {anime.genre.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genre.slice(0, 2).map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="text-xs px-1 py-0"
                  style={{
                    borderColor: "var(--tg-link-color, #2481cc)",
                    color: "var(--tg-link-color, #2481cc)",
                  }}
                >
                  {genre}
                </Badge>
              ))}
              {anime.genre.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{anime.genre.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
