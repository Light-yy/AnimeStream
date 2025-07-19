"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full h-40 bg-gray-300 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse" />
              <div className="flex space-x-1">
                <div className="h-5 bg-gray-300 rounded w-12 animate-pulse" />
                <div className="h-5 bg-gray-300 rounded w-16 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-12 bg-gray-300 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded animate-pulse" />
                <div className="h-3 bg-gray-300 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
