"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Lightbulb, Trophy } from "lucide-react"

interface CTFChallenge {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  reward_bitcoins: number
  hint: string
  flag: string
}

interface CTFChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onSolve: (challengeId: string, answer: string) => void
}

export function CTFChallengeModal({ isOpen, onClose, onSolve }: CTFChallengeModalProps) {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<CTFChallenge | null>(null)
  const [answer, setAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadChallenges()
    }
  }, [isOpen])

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from("ctf_challenges")
        .select("*")
        .eq("is_active", true)
        .order("difficulty", { ascending: true })

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error("Error loading challenges:", error)
    }
  }

  const handleSolve = async () => {
    if (!selectedChallenge || !answer) return

    setLoading(true)
    await onSolve(selectedChallenge.id, answer.trim())
    setLoading(false)
    setAnswer("")
    setShowHint(false)
    onClose()
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "web":
        return "🌐"
      case "crypto":
        return "🔐"
      case "reverse":
        return "🔄"
      case "pwn":
        return "💣"
      case "forensics":
        return "🔍"
      default:
        return "🎯"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            CTF Challenge Arena
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenge List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Available Challenges</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {challenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors ${
                    selectedChallenge?.id === challenge.id ? "border-blue-500" : "hover:border-gray-500"
                  }`}
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(challenge.category)}</span>
                        {challenge.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          ₿{challenge.reward_bitcoins}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-300 text-sm">
                      {challenge.description.length > 100
                        ? `${challenge.description.substring(0, 100)}...`
                        : challenge.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Challenge Details */}
          <div className="space-y-4">
            {selectedChallenge ? (
              <>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(selectedChallenge.category)}</span>
                      {selectedChallenge.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                        {selectedChallenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        ₿{selectedChallenge.reward_bitcoins}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4">{selectedChallenge.description}</p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="answer" className="text-white">
                        Submit Flag
                      </Label>
                      <Input
                        id="answer"
                        type="text"
                        placeholder="CTF{your_flag_here}"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowHint(!showHint)}
                        variant="outline"
                        className="bg-gray-600 border-gray-500 text-white"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </Button>

                      <Button
                        onClick={handleSolve}
                        disabled={!answer || loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? "Submitting..." : "Submit Flag"}
                      </Button>
                    </div>

                    {showHint && (
                      <div className="bg-blue-900/20 border border-blue-500 p-3 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          <strong>Hint:</strong> {selectedChallenge.hint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-700 p-8 rounded-lg text-center">
                <Code className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Select a challenge to get started</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
