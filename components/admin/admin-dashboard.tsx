"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Users, Trophy, MessageSquare, Settings, Plus, CheckCircle, Clock, BarChart3 } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalGames: number
  activeSupportTickets: number
  totalChallenges: number
}

export default function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 0,
    activeSupportTickets: 0,
    totalChallenges: 0,
  })
  const [users, setUsers] = useState<any[]>([])
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    category: "web",
    reward_bitcoins: 50,
    hint: "",
    flag: "",
  })
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      // Load stats
      const [usersResult, gamesResult, ticketsResult, challengesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("game_rooms").select("id", { count: "exact" }),
        supabase.from("support_tickets").select("id", { count: "exact" }).in("status", ["open", "in_progress"]),
        supabase.from("ctf_challenges").select("id", { count: "exact" }),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalGames: gamesResult.count || 0,
        activeSupportTickets: ticketsResult.count || 0,
        totalChallenges: challengesResult.count || 0,
      })

      // Load detailed data
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      const { data: ticketsData } = await supabase
        .from("support_tickets")
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey(username)
        `)
        .order("created_at", { ascending: false })

      const { data: challengesData } = await supabase
        .from("ctf_challenges")
        .select("*")
        .order("created_at", { ascending: false })

      setUsers(usersData || [])
      setSupportTickets(ticketsData || [])
      setChallenges(challengesData || [])
    } catch (error) {
      console.error("Error loading admin data:", error)
    }
    setLoading(false)
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          status,
          updated_at: new Date().toISOString(),
          assigned_to: status === "in_progress" ? user.id : null,
        })
        .eq("id", ticketId)

      if (error) throw error

      toast({
        title: "Ticket Updated",
        description: `Ticket status changed to ${status}`,
      })

      loadAdminData()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const createChallenge = async () => {
    if (!newChallenge.title || !newChallenge.flag) {
      toast({
        title: "Invalid Challenge",
        description: "Title and flag are required",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("ctf_challenges").insert([
        {
          ...newChallenge,
          created_by: user.id,
        },
      ])

      if (error) throw error

      toast({
        title: "Challenge Created",
        description: "New CTF challenge has been added",
      })

      setNewChallenge({
        title: "",
        description: "",
        difficulty: "easy",
        category: "web",
        reward_bitcoins: 50,
        hint: "",
        flag: "",
      })

      loadAdminData()
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const toggleChallengeStatus = async (challengeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("ctf_challenges").update({ is_active: !isActive }).eq("id", challengeId)

      if (error) throw error

      toast({
        title: "Challenge Updated",
        description: `Challenge ${!isActive ? "activated" : "deactivated"}`,
      })

      loadAdminData()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-orange-500"
      case "expert":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage CTF Monopoly game and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Games</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSupportTickets}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">CTF Challenges</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalChallenges}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="users" className="text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="support" className="text-white">
              Support
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-white">
              Challenges
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          {user.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.is_admin && <Badge className="bg-purple-600">Admin</Badge>}
                        <Badge variant="outline" className="text-gray-300">
                          {user.total_games_played} games
                        </Badge>
                        <p className="text-sm text-gray-400">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Support Tickets</CardTitle>
                <CardDescription className="text-gray-400">Manage user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                          <h3 className="font-semibold text-white">{ticket.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400">
                          {ticket.user?.username} • {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-300 mb-4">{ticket.description}</p>
                      <div className="flex space-x-2">
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => updateTicketStatus(ticket.id, "in_progress")}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Start Working
                          </Button>
                        )}
                        {ticket.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => updateTicketStatus(ticket.id, "resolved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">CTF Challenges</CardTitle>
                  <CardDescription className="text-gray-400">Manage game challenges and rewards</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Challenge</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Title</Label>
                        <Input
                          value={newChallenge.title}
                          onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Category</Label>
                        <Select
                          value={newChallenge.category}
                          onValueChange={(value) => setNewChallenge({ ...newChallenge, category: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                            <SelectItem value="reverse">Reverse</SelectItem>
                            <SelectItem value="pwn">Pwn</SelectItem>
                            <SelectItem value="forensics">Forensics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Difficulty</Label>
                        <Select
                          value={newChallenge.difficulty}
                          onValueChange={(value) => setNewChallenge({ ...newChallenge, difficulty: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Reward (Bitcoin)</Label>
                        <Input
                          type="number"
                          value={newChallenge.reward_bitcoins}
                          onChange={(e) =>
                            setNewChallenge({ ...newChallenge, reward_bitcoins: Number.parseInt(e.target.value) || 0 })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-white">Description</Label>
                        <Textarea
                          value={newChallenge.description}
                          onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Hint</Label>
                        <Input
                          value={newChallenge.hint}
                          onChange={(e) => setNewChallenge({ ...newChallenge, hint: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Flag</Label>
                        <Input
                          value={newChallenge.flag}
                          onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="CTF{flag_here}"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button onClick={createChallenge} className="w-full bg-green-600 hover:bg-green-700">
                          Create Challenge
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{challenge.title}</h3>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            ₿{challenge.reward_bitcoins}
                          </Badge>
                          <Badge className={challenge.is_active ? "bg-green-600" : "bg-gray-600"}>
                            {challenge.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleChallengeStatus(challenge.id, challenge.is_active)}
                            className="border-gray-600"
                          >
                            {challenge.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-300">{challenge.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Game Analytics
                </CardTitle>
                <CardDescription className="text-gray-400">Platform statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Analytics dashboard coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Will include user engagement, game completion rates, and revenue metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
