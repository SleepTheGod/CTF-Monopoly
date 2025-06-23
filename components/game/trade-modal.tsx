"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  gameState: any
  currentUserId: string
}

interface TradeOffer {
  id: string
  from_user_id: string
  to_user_id: string
  offered_properties: number[]
  offered_bitcoins: number
  requested_properties: number[]
  requested_bitcoins: number
  status: string
  expires_at: string
  created_at: string
}

export function TradeModal({ isOpen, onClose, gameState, currentUserId }: TradeModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "pending">("create")
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [offeredProperties, setOfferedProperties] = useState<number[]>([])
  const [requestedProperties, setRequestedProperties] = useState<number[]>([])
  const [offeredBitcoins, setOfferedBitcoins] = useState<number>(0)
  const [requestedBitcoins, setRequestedBitcoins] = useState<number>(0)
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([])
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadTradeOffers()
    }
  }, [isOpen])

  const loadTradeOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("trade_offers")
        .select(`
          *,
          from_profile:profiles!trade_offers_from_user_id_fkey(username),
          to_profile:profiles!trade_offers_to_user_id_fkey(username)
        `)
        .eq("game_room_id", gameState.roomId)
        .in("status", ["pending"])
        .order("created_at", { ascending: false })

      if (error) throw error
      setTradeOffers(data || [])
    } catch (error) {
      console.error("Error loading trade offers:", error)
    }
  }

  const createTradeOffer = async () => {
    if (!selectedPlayer || (offeredProperties.length === 0 && offeredBitcoins === 0)) {
      toast({
        title: "Invalid Trade",
        description: "Please select a player and offer something",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("trade_offers").insert([
        {
          game_room_id: gameState.roomId,
          from_user_id: currentUserId,
          to_user_id: selectedPlayer,
          offered_properties: offeredProperties,
          offered_bitcoins: offeredBitcoins,
          requested_properties: requestedProperties,
          requested_bitcoins: requestedBitcoins,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        },
      ])

      if (error) throw error

      toast({
        title: "Trade Offer Sent",
        description: "Your trade offer has been sent to the player",
      })

      // Reset form
      setSelectedPlayer("")
      setOfferedProperties([])
      setRequestedProperties([])
      setOfferedBitcoins(0)
      setRequestedBitcoins(0)

      loadTradeOffers()
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const respondToTrade = async (tradeId: string, accept: boolean) => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from("trade_offers")
        .update({
          status: accept ? "accepted" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tradeId)

      if (error) throw error

      toast({
        title: accept ? "Trade Accepted" : "Trade Rejected",
        description: `You ${accept ? "accepted" : "rejected"} the trade offer`,
      })

      loadTradeOffers()
    } catch (error: any) {
      toast({
        title: "Trade Response Failed",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const getCurrentPlayerProperties = () => {
    const currentPlayer = gameState.players.find((p: any) => p.userId === currentUserId)
    if (!currentPlayer) return []

    return gameState.properties.filter((prop: any) => prop.owner === currentPlayer.id && prop.price > 0)
  }

  const getSelectedPlayerProperties = () => {
    const selectedPlayerObj = gameState.players.find((p: any) => p.userId === selectedPlayer)
    if (!selectedPlayerObj) return []

    return gameState.properties.filter((prop: any) => prop.owner === selectedPlayerObj.id && prop.price > 0)
  }

  const getPlayerByUserId = (userId: string) => {
    return gameState.players.find((p: any) => p.userId === userId)
  }

  const getPropertyById = (id: number) => {
    return gameState.properties.find((p: any) => p.id === id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Property Trading Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "create" ? "default" : "outline"}
              onClick={() => setActiveTab("create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Trade
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => setActiveTab("pending")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Pending Trades ({tradeOffers.length})
            </Button>
          </div>

          {/* Create Trade Tab */}
          {activeTab === "create" && (
            <div className="space-y-6">
              {/* Select Player */}
              <div className="space-y-2">
                <Label className="text-white">Trade With</Label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a player" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {gameState.players
                      .filter((p: any) => p.userId !== currentUserId)
                      .map((player: any) => (
                        <SelectItem key={player.userId} value={player.userId} className="text-white">
                          {player.icon} {player.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What You Offer */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">You Offer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Offer Properties */}
                    <div className="space-y-2">
                      <Label className="text-white">Properties</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {getCurrentPlayerProperties().map((property: any) => (
                          <div key={property.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`offer-${property.id}`}
                              checked={offeredProperties.includes(property.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setOfferedProperties([...offeredProperties, property.id])
                                } else {
                                  setOfferedProperties(offeredProperties.filter((id) => id !== property.id))
                                }
                              }}
                            />
                            <label htmlFor={`offer-${property.id}`} className="text-sm text-white cursor-pointer">
                              {property.name} (₿{property.price})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer Bitcoins */}
                    <div className="space-y-2">
                      <Label htmlFor="offer-bitcoins" className="text-white">
                        Bitcoins
                      </Label>
                      <Input
                        id="offer-bitcoins"
                        type="number"
                        min="0"
                        value={offeredBitcoins}
                        onChange={(e) => setOfferedBitcoins(Number.parseInt(e.target.value) || 0)}
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* What You Want */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">You Want</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Request Properties */}
                    <div className="space-y-2">
                      <Label className="text-white">Properties</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedPlayer &&
                          getSelectedPlayerProperties().map((property: any) => (
                            <div key={property.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`request-${property.id}`}
                                checked={requestedProperties.includes(property.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRequestedProperties([...requestedProperties, property.id])
                                  } else {
                                    setRequestedProperties(requestedProperties.filter((id) => id !== property.id))
                                  }
                                }}
                              />
                              <label htmlFor={`request-${property.id}`} className="text-sm text-white cursor-pointer">
                                {property.name} (₿{property.price})
                              </label>
                            </div>
                          ))}
                        {selectedPlayer && getSelectedPlayerProperties().length === 0 && (
                          <p className="text-gray-400 text-sm">Player has no properties</p>
                        )}
                      </div>
                    </div>

                    {/* Request Bitcoins */}
                    <div className="space-y-2">
                      <Label htmlFor="request-bitcoins" className="text-white">
                        Bitcoins
                      </Label>
                      <Input
                        id="request-bitcoins"
                        type="number"
                        min="0"
                        value={requestedBitcoins}
                        onChange={(e) => setRequestedBitcoins(Number.parseInt(e.target.value) || 0)}
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={createTradeOffer} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Sending Trade..." : "Send Trade Offer"}
              </Button>
            </div>
          )}

          {/* Pending Trades Tab */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {tradeOffers.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No pending trade offers</p>
                </div>
              ) : (
                tradeOffers.map((offer) => (
                  <Card key={offer.id} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          Trade from {getPlayerByUserId(offer.from_user_id)?.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          Expires: {new Date(offer.expires_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* They Offer */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white">They Offer:</h4>
                          <div className="space-y-1">
                            {offer.offered_properties.map((propId: number) => {
                              const property = getPropertyById(propId)
                              return property ? (
                                <p key={propId} className="text-sm text-gray-300">
                                  🏠 {property.name} (₿{property.price})
                                </p>
                              ) : null
                            })}
                            {offer.offered_bitcoins > 0 && (
                              <p className="text-sm text-gray-300">₿ {offer.offered_bitcoins} Bitcoins</p>
                            )}
                          </div>
                        </div>

                        {/* They Want */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white">They Want:</h4>
                          <div className="space-y-1">
                            {offer.requested_properties.map((propId: number) => {
                              const property = getPropertyById(propId)
                              return property ? (
                                <p key={propId} className="text-sm text-gray-300">
                                  🏠 {property.name} (₿{property.price})
                                </p>
                              ) : null
                            })}
                            {offer.requested_bitcoins > 0 && (
                              <p className="text-sm text-gray-300">₿ {offer.requested_bitcoins} Bitcoins</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {offer.to_user_id === currentUserId && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => respondToTrade(offer.id, true)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => respondToTrade(offer.id, false)}
                            disabled={loading}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {offer.from_user_id === currentUserId && (
                        <div className="pt-4">
                          <p className="text-sm text-yellow-400">Waiting for response...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
