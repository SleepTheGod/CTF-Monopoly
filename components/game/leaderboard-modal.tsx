"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, TrendingUp, Target } from "lucide-react"

interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  position: number
  bitcoins_earned: number
  properties_owned: number
  game_duration_minutes: number
  created_at: string
}

interface GlobalStats {
  total_games: number
  total_wins: number
  total_bitcoins: number
  average_game_time: number
  rank: number
}

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all")

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
      loadGlobalStats()
    }
  }, [isOpen, timeFilter])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("leaderboard")
        .select(`
          *,
          profiles!leaderboard_user_id_fkey(username)
        `)
        .order("bitcoins_earned", { ascending: false })
        .limit(50)

      if (timeFilter === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", weekAgo)
      } else if (timeFilter === "month") {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", monthAgo)
      }

      const { data, error } = await query

      if (error) throw error

      const processedData =
        data?.map((entry: any, index: number) => ({
          ...entry,
          username: entry.profiles?.username || "Anonymous",
          position: index + 1,
        })) || []

      setLeaderboardData(processedData)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
    setLoading(false)
  }

  const loadGlobalStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("total_games_played, total_wins, total_bitcoins_earned, rank")
        .eq("id", user.user.id)
        .single()

      if (error) throw error

      if (data) {
        setGlobalStats({
          total_games: data.total_games_played,
          total_wins: data.total_wins,
          total_bitcoins: data.total_bitcoins_earned,
          average_game_time: 0, // Calculate from game history
          rank: data.rank,
        })
      }
    } catch (error) {
      console.error("Error loading global stats:", error)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{position}</span>
    }
  }

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-600 to-yellow-500"
      case 2:
        return "bg-gradient-to-r from-gray-600 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-orange-600 to-orange-500"
      default:
        return "bg-gray-700"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard & Statistics
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="leaderboard" className="text-white">
              Global Leaderboard
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-white">
              My Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            {/* Time Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter("all")}
                className={`px-3 py-1 rounded text-sm ${
                  timeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter("month")}
                className={`px-3 py-1 rounded text-sm ${
                  timeFilter === "month" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter("week")}
                className={`px-3 py-1 rounded text-sm ${
                  timeFilter === "week" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                This Week
              </button>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading leaderboard...</p>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No games played yet</p>
                </div>
              ) : (
                leaderboardData.map((entry) => (
                  <Card key={entry.id} className={`${getRankColor(entry.position)} border-gray-600`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getRankIcon(entry.position)}
                          <div>
                            <h3 className="font-bold text-white">{entry.username}</h3>
                            <p className="text-sm text-gray-300">
                              {entry.properties_owned} properties • {entry.game_duration_minutes}min game
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            ₿{entry.bitcoins_earned.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-300">{new Date(entry.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {globalStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Games Stats */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Game Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Games</span>
                      <span className="text-white font-bold">{globalStats.total_games}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Wins</span>
                      <span className="text-green-400 font-bold">{globalStats.total_wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Win Rate</span>
                      <span className="text-blue-400 font-bold">
                        {globalStats.total_games > 0
                          ? Math.round((globalStats.total_wins / globalStats.total_games) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Global Rank</span>
                      <Badge className="bg-purple-600">#{globalStats.rank}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Earnings Stats */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Earnings & Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Bitcoins</span>
                      <span className="text-yellow-400 font-bold">₿{globalStats.total_bitcoins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Average per Game</span>
                      <span className="text-orange-400 font-bold">
                        ₿
                        {globalStats.total_games > 0
                          ? Math.round(globalStats.total_bitcoins / globalStats.total_games)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Best Single Game</span>
                      <span className="text-red-400 font-bold">
                        ₿{leaderboardData.length > 0 ? Math.max(...leaderboardData.map((d) => d.bitcoins_earned)) : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-gray-700 border-gray-600 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🏆</div>
                        <p className="text-sm text-gray-300">First Win</p>
                        <Badge className={globalStats.total_wins > 0 ? "bg-green-600" : "bg-gray-600"}>
                          {globalStats.total_wins > 0 ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <p className="text-sm text-gray-300">Bitcoin Collector</p>
                        <Badge className={globalStats.total_bitcoins >= 1000 ? "bg-green-600" : "bg-gray-600"}>
                          {globalStats.total_bitcoins >= 1000 ? "Unlocked" : `${globalStats.total_bitcoins}/1000`}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎮</div>
                        <p className="text-sm text-gray-300">Veteran Player</p>
                        <Badge className={globalStats.total_games >= 10 ? "bg-green-600" : "bg-gray-600"}>
                          {globalStats.total_games >= 10 ? "Unlocked" : `${globalStats.total_games}/10`}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔥</div>
                        <p className="text-sm text-gray-300">Win Streak</p>
                        <Badge className="bg-gray-600">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading your statistics...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
