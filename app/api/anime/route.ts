import { NextResponse } from "next/server"
import { JikanAPI, transformAnimeData } from "@/lib/anime-api"

const jikanAPI = new JikanAPI()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const query = searchParams.get("q")
  const id = searchParams.get("id")

  try {
    switch (type) {
      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query parameter required" }, { status: 400 })
        }
        const searchResults = await jikanAPI.searchAnime(query)
        const transformedSearch = searchResults.map(transformAnimeData)
        return NextResponse.json(transformedSearch)

      case "trending":
        const trendingResults = await jikanAPI.getTrendingAnime()
        const transformedTrending = trendingResults.map(transformAnimeData)
        return NextResponse.json(transformedTrending)

      case "seasonal":
        const seasonalResults = await jikanAPI.getSeasonalAnime()
        const transformedSeasonal = seasonalResults.map(transformAnimeData)
        return NextResponse.json(transformedSeasonal)

      case "details":
        if (!id) {
          return NextResponse.json({ error: "ID parameter required" }, { status: 400 })
        }
        const details = await jikanAPI.getAnimeDetails(Number.parseInt(id))
        if (!details) {
          return NextResponse.json({ error: "Anime not found" }, { status: 404 })
        }
        const transformedDetails = transformAnimeData(details)
        return NextResponse.json(transformedDetails)

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
