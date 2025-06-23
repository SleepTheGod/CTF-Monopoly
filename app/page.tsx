"use client"

import { useState } from "react"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Shield, Zap, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Property {
  id: number
  name: string
  price: number
  rent: number
  color: string
  owner: number | null
  description: string
  meme: string
}

interface Player {
  id: number
  name: string
  position: number
  money: number
  color: string
  icon: string
}

const properties: Property[] = [
  {
    id: 0,
    name: "START",
    price: 0,
    rent: 0,
    color: "bg-green-500",
    owner: null,
    description: "Collect 200 Bitcoin as you pass",
    meme: "🚀 Welcome to the matrix, Neo",
  },
  {
    id: 1,
    name: "SQL Injection",
    price: 60,
    rent: 10,
    color: "bg-purple-500",
    owner: null,
    description: "'; DROP TABLE users; --",
    meme: "Little Bobby Tables strikes again!",
  },
  {
    id: 2,
    name: "Buffer Overflow",
    price: 60,
    rent: 12,
    color: "bg-purple-500",
    owner: null,
    description: "Stack smashing detected!",
    meme: "AAAAAAAAAAAAAAAAAAAAAA",
  },
  {
    id: 3,
    name: "Social Engineering",
    price: 100,
    rent: 15,
    color: "bg-blue-500",
    owner: null,
    description: "The art of human hacking",
    meme: "Trust me, I'm from IT",
  },
  {
    id: 4,
    name: "XSS Attack",
    price: 100,
    rent: 18,
    color: "bg-blue-500",
    owner: null,
    description: "<script>alert('pwned')</script>",
    meme: "It's not a bug, it's a feature!",
  },
  {
    id: 5,
    name: "Phishing",
    price: 120,
    rent: 20,
    color: "bg-blue-500",
    owner: null,
    description: "You've won a million dollars!",
    meme: "Nigerian Prince needs your help",
  },
  {
    id: 6,
    name: "JAIL",
    price: 0,
    rent: 0,
    color: "bg-red-500",
    owner: null,
    description: "Caught by the cyber police",
    meme: "Consequences will never be the same!",
  },
  {
    id: 7,
    name: "DDoS Attack",
    price: 140,
    rent: 25,
    color: "bg-orange-500",
    owner: null,
    description: "Low Orbit Ion Cannon activated",
    meme: "We are Anonymous. We are Legion.",
  },
  {
    id: 8,
    name: "Man in the Middle",
    price: 140,
    rent: 28,
    color: "bg-orange-500",
    owner: null,
    description: "Intercepting all your packets",
    meme: "I see what you did there",
  },
  {
    id: 9,
    name: "Privilege Escalation",
    price: 160,
    rent: 30,
    color: "bg-orange-500",
    owner: null,
    description: "sudo su - root",
    meme: "I am root now",
  },
  {
    id: 10,
    name: "Ransomware",
    price: 180,
    rent: 35,
    color: "bg-red-600",
    owner: null,
    description: "Your files are encrypted",
    meme: "Pay 1 Bitcoin or else...",
  },
  {
    id: 11,
    name: "Zero Day",
    price: 200,
    rent: 40,
    color: "bg-red-600",
    owner: null,
    description: "Unknown vulnerability exploited",
    meme: "It's not a bug, it's undocumented",
  },
  {
    id: 12,
    name: "FREE WIFI",
    price: 0,
    rent: 0,
    color: "bg-yellow-500",
    owner: null,
    description: "Definitely not a honeypot",
    meme: "Free WiFi? What could go wrong?",
  },
  {
    id: 13,
    name: "Cryptojacking",
    price: 220,
    rent: 45,
    color: "bg-green-600",
    owner: null,
    description: "Mining crypto on your CPU",
    meme: "Why is my computer so slow?",
  },
  {
    id: 14,
    name: "Backdoor",
    price: 240,
    rent: 50,
    color: "bg-green-600",
    owner: null,
    description: "Secret entrance installed",
    meme: "I'll be back... door",
  },
  {
    id: 15,
    name: "APT",
    price: 260,
    rent: 55,
    color: "bg-green-600",
    owner: null,
    description: "Advanced Persistent Threat",
    meme: "We've been trying to reach you...",
  },
  {
    id: 16,
    name: "Pwned",
    price: 280,
    rent: 60,
    color: "bg-pink-500",
    owner: null,
    description: "Your password was 'password'",
    meme: "Have I Been Pwned?",
  },
  {
    id: 17,
    name: "Root Access",
    price: 300,
    rent: 65,
    color: "bg-pink-500",
    owner: null,
    description: "Ultimate system control",
    meme: "With great power...",
  },
  {
    id: 18,
    name: "GO TO JAIL",
    price: 0,
    rent: 0,
    color: "bg-red-500",
    owner: null,
    description: "Straight to cyber jail",
    meme: "You dun goofed!",
  },
  {
    id: 19,
    name: "Kernel Panic",
    price: 350,
    rent: 70,
    color: "bg-gray-800",
    owner: null,
    description: "System.exe has stopped working",
    meme: "Blue Screen of Death",
  },
]

const players: Player[] = [
  { id: 1, name: "Script Kiddie", position: 0, money: 1500, color: "bg-blue-600", icon: "👶" },
  { id: 2, name: "White Hat", position: 0, money: 1500, color: "bg-white", icon: "🤠" },
  { id: 3, name: "Black Hat", position: 0, money: 1500, color: "bg-black", icon: "🎩" },
  { id: 4, name: "Gray Hat", position: 0, money: 1500, color: "bg-gray-600", icon: "🕵️" },
]

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
  const Icon = icons[value - 1]
  return <Icon className="w-8 h-8" />
}

export default function CTFMonopoly() {
  const [gameState, setGameState] = useState({
    players: players,
    currentPlayer: 0,
    properties: properties,
    dice: [1, 1],
    gameLog: ["🎮 Welcome to CTF Monopoly! Script Kiddie's turn."],
    selectedProperty: null as Property | null,
  })

  const [isRolling, setIsRolling] = useState(false)

  const rollDice = () => {
    if (isRolling) return

    setIsRolling(true)

    // Animate dice rolling
    const rollAnimation = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
      }))
    }, 100)

    setTimeout(() => {
      clearInterval(rollAnimation)
      const finalDice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
      const total = finalDice[0] + finalDice[1]

      setGameState((prev) => {
        const newPlayers = [...prev.players]
        const currentPlayer = newPlayers[prev.currentPlayer]
        const newPosition = (currentPlayer.position + total) % 20

        // Check if passed START
        if (currentPlayer.position + total >= 20) {
          currentPlayer.money += 200
          prev.gameLog.unshift(`💰 ${currentPlayer.name} passed START and collected 200 Bitcoin!`)
        }

        currentPlayer.position = newPosition
        const landedProperty = prev.properties[newPosition]

        const newLog = [...prev.gameLog]
        newLog.unshift(`🎲 ${currentPlayer.name} rolled ${finalDice[0]} + ${finalDice[1]} = ${total}`)
        newLog.unshift(`📍 ${currentPlayer.name} landed on ${landedProperty.name}`)

        // Handle property logic
        if (landedProperty.price > 0) {
          if (landedProperty.owner === null) {
            newLog.unshift(`🏠 ${landedProperty.name} is available for ${landedProperty.price} Bitcoin`)
          } else if (landedProperty.owner !== currentPlayer.id) {
            const owner = newPlayers.find((p) => p.id === landedProperty.owner)
            if (owner && currentPlayer.money >= landedProperty.rent) {
              currentPlayer.money -= landedProperty.rent
              owner.money += landedProperty.rent
              newLog.unshift(`💸 ${currentPlayer.name} paid ${landedProperty.rent} Bitcoin rent to ${owner.name}`)
            } else if (owner) {
              newLog.unshift(`💸 ${currentPlayer.name} can't afford rent! Game over!`)
            }
          }
        }

        return {
          ...prev,
          players: newPlayers,
          dice: finalDice,
          gameLog: newLog.slice(0, 10), // Keep only last 10 messages
          currentPlayer: (prev.currentPlayer + 1) % prev.players.length,
        }
      })

      setIsRolling(false)
    }, 1000)
  }

  const buyProperty = () => {
    setGameState((prev) => {
      const newPlayers = [...prev.players]
      const newProperties = [...prev.properties]
      const currentPlayer = newPlayers[prev.currentPlayer === 0 ? 3 : prev.currentPlayer - 1] // Previous player who just moved
      const property = newProperties[currentPlayer.position]

      if (property.price > 0 && property.owner === null && currentPlayer.money >= property.price) {
        currentPlayer.money -= property.price
        property.owner = currentPlayer.id

        const newLog = [...prev.gameLog]
        newLog.unshift(`🏠 ${currentPlayer.name} bought ${property.name} for ${property.price} Bitcoin!`)

        return {
          ...prev,
          players: newPlayers,
          properties: newProperties,
          gameLog: newLog.slice(0, 10),
        }
      }

      return prev
    })
  }

  const getPlayerAtPosition = (position: number) => {
    return gameState.players.filter((player) => player.position === position)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🏴‍☠️ CTF MONOPOLY 🏴‍☠️
          </h1>
          <p className="text-gray-300">Hack the planet, one property at a time!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {gameState.properties.slice(0, 5).map((property, index) => (
                  <Dialog key={property.id}>
                    <DialogTrigger asChild>
                      <div
                        className={`${property.color} p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative min-h-[100px] flex flex-col justify-between`}
                      >
                        <div className="text-xs font-bold text-center text-white">{property.name}</div>
                        {property.price > 0 && <div className="text-xs text-center text-white">₿{property.price}</div>}
                        {property.owner && (
                          <div className="absolute top-1 right-1">
                            <div
                              className={`w-3 h-3 rounded-full ${gameState.players.find((p) => p.id === property.owner)?.color}`}
                            ></div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getPlayerAtPosition(property.id).map((player) => (
                            <span key={player.id} className="text-lg">
                              {player.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">{property.name}</DialogTitle>
                      </DialogHeader>
                      <div className="text-gray-300">
                        <p className="mb-2">{property.description}</p>
                        <p className="text-sm italic mb-4">"{property.meme}"</p>
                        {property.price > 0 && (
                          <div>
                            <p>Price: ₿{property.price}</p>
                            <p>Rent: ₿{property.rent}</p>
                            {property.owner && (
                              <p>Owner: {gameState.players.find((p) => p.id === property.owner)?.name}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {gameState.properties
                  .slice(15, 20)
                  .reverse()
                  .map((property, index) => (
                    <Dialog key={property.id}>
                      <DialogTrigger asChild>
                        <div
                          className={`${property.color} p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative min-h-[100px] flex flex-col justify-between`}
                        >
                          <div className="text-xs font-bold text-center text-white">{property.name}</div>
                          {property.price > 0 && (
                            <div className="text-xs text-center text-white">₿{property.price}</div>
                          )}
                          {property.owner && (
                            <div className="absolute top-1 right-1">
                              <div
                                className={`w-3 h-3 rounded-full ${gameState.players.find((p) => p.id === property.owner)?.color}`}
                              ></div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getPlayerAtPosition(property.id).map((player) => (
                              <span key={player.id} className="text-lg">
                                {player.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">{property.name}</DialogTitle>
                        </DialogHeader>
                        <div className="text-gray-300">
                          <p className="mb-2">{property.description}</p>
                          <p className="text-sm italic mb-4">"{property.meme}"</p>
                          {property.price > 0 && (
                            <div>
                              <p>Price: ₿{property.price}</p>
                              <p>Rent: ₿{property.rent}</p>
                              {property.owner && (
                                <p>Owner: {gameState.players.find((p) => p.id === property.owner)?.name}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div></div>
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">🎲 Roll Dice</h3>
                    <div className="flex justify-center gap-2 mb-4">
                      <DiceIcon value={gameState.dice[0]} />
                      <DiceIcon value={gameState.dice[1]} />
                    </div>
                    <Button onClick={rollDice} disabled={isRolling} className="bg-green-600 hover:bg-green-700">
                      {isRolling ? "Rolling..." : "Roll Dice"}
                    </Button>
                    <div className="mt-2">
                      <Button onClick={buyProperty} className="bg-blue-600 hover:bg-blue-700 text-sm" size="sm">
                        Buy Property
                      </Button>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {gameState.properties.slice(5, 15).map((property, index) => (
                  <Dialog key={property.id}>
                    <DialogTrigger asChild>
                      <div
                        className={`${property.color} p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative min-h-[100px] flex flex-col justify-between`}
                      >
                        <div className="text-xs font-bold text-center text-white">{property.name}</div>
                        {property.price > 0 && <div className="text-xs text-center text-white">₿{property.price}</div>}
                        {property.owner && (
                          <div className="absolute top-1 right-1">
                            <div
                              className={`w-3 h-3 rounded-full ${gameState.players.find((p) => p.id === property.owner)?.color}`}
                            ></div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getPlayerAtPosition(property.id).map((player) => (
                            <span key={player.id} className="text-lg">
                              {player.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">{property.name}</DialogTitle>
                      </DialogHeader>
                      <div className="text-gray-300">
                        <p className="mb-2">{property.description}</p>
                        <p className="text-sm italic mb-4">"{property.meme}"</p>
                        {property.price > 0 && (
                          <div>
                            <p>Price: ₿{property.price}</p>
                            <p>Rent: ₿{property.rent}</p>
                            {property.owner && (
                              <p>Owner: {gameState.players.find((p) => p.id === property.owner)?.name}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border ${
                        index === gameState.currentPlayer
                          ? "border-green-500 bg-green-900/20"
                          : "border-gray-600 bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{player.icon}</span>
                          <span className="font-semibold text-white">{player.name}</span>
                        </div>
                        {index === gameState.currentPlayer && <Badge className="bg-green-600">Current</Badge>}
                      </div>
                      <div className="text-sm text-gray-300">
                        <div>₿{player.money}</div>
                        <div>Position: {gameState.properties[player.position].name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Log */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Game Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameState.gameLog.map((log, index) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-gray-700/50 rounded">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meme of the Day */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Hacker Wisdom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl mb-2">🧠</p>
                  <p className="text-sm text-gray-300 italic">
                    "The best way to learn hacking is to hack... legally in CTFs!"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
