"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Star, X, FileText, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import ComprehensiveReport from "./comprehensive-report"
import ProfessionalPDFReport from "./professional-pdf-report"

interface InspectionItem {
  id: string
  name: string
  cleanliness: number
  organization: number
  protocol: number
  comments: string
  photos: string[]
}

interface InspectionArea {
  id: string
  name: string
  items: InspectionItem[]
  weight: number
}

export default function MobileJanitorialChecklist() {
  const [activeTab, setActiveTab] = useState("info")
  const [showReport, setShowReport] = useState(false)
  const [showComprehensiveReport, setShowComprehensiveReport] = useState(false)
  const [showPDFReport, setShowPDFReport] = useState(false)

  const [inspectorInfo, setInspectorInfo] = useState({
    inspectorName: "",
    facilityName: "",
    date: new Date().toISOString().split("T")[0],
    shift: "",
    cleaningTeam: "",
  })

  const [areas, setAreas] = useState<InspectionArea[]>([
    {
      id: "restrooms",
      name: "Restrooms",
      weight: 0.25,
      items: [
        {
          id: "toilets",
          name: "Toilets & Urinals",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "sinks",
          name: "Sinks & Mirrors",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "floors",
          name: "Floor & Drains",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "supplies",
          name: "Supplies & Dispensers",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
      ],
    },
    {
      id: "offices",
      name: "Offices",
      weight: 0.3,
      items: [
        {
          id: "desks",
          name: "Desks & Workstations",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "floors-office",
          name: "Floors & Carpets",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "trash-office",
          name: "Trash & Recycling",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "windows",
          name: "Windows & Glass",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
      ],
    },
    {
      id: "common",
      name: "Common Areas",
      weight: 0.25,
      items: [
        {
          id: "lobby",
          name: "Lobby & Reception",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "kitchen",
          name: "Kitchen & Break Room",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "hallways",
          name: "Hallways & Stairs",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        { id: "elevators", name: "Elevators", cleanliness: 0, organization: 0, protocol: 0, comments: "", photos: [] },
      ],
    },
    {
      id: "exterior",
      name: "Exterior",
      weight: 0.2,
      items: [
        {
          id: "entrance",
          name: "Entrance & Exits",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "parking",
          name: "Parking Areas",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
        {
          id: "landscaping",
          name: "Landscaping Areas",
          cleanliness: 0,
          organization: 0,
          protocol: 0,
          comments: "",
          photos: [],
        },
      ],
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateItemRating = (
    areaId: string,
    itemId: string,
    category: "cleanliness" | "organization" | "protocol",
    value: number,
  ) => {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map((item) => (item.id === itemId ? { ...item, [category]: value } : item)),
            }
          : area,
      ),
    )
  }

  const updateItemComments = (areaId: string, itemId: string, comments: string) => {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map((item) => (item.id === itemId ? { ...item, comments } : item)),
            }
          : area,
      ),
    )
  }

  const handlePhotoUpload = (areaId: string, itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const photoUrl = e.target?.result as string
          setAreas((prev) =>
            prev.map((area) =>
              area.id === areaId
                ? {
                    ...area,
                    items: area.items.map((item) =>
                      item.id === itemId ? { ...item, photos: [...item.photos, photoUrl] } : item,
                    ),
                  }
                : area,
            ),
          )
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (areaId: string, itemId: string, photoIndex: number) => {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === areaId
          ? {
              ...area,
              items: area.items.map((item) =>
                item.id === itemId ? { ...item, photos: item.photos.filter((_, index) => index !== photoIndex) } : item,
              ),
            }
          : area,
      ),
    )
  }

  const calculateItemScore = (item: InspectionItem) => {
    return Math.round(((item.cleanliness + item.organization + item.protocol) / 3) * 20)
  }

  const calculateAreaScore = (area: InspectionArea) => {
    const totalScore = area.items.reduce((sum, item) => sum + calculateItemScore(item), 0)
    return Math.round(totalScore / area.items.length)
  }

  const calculateOverallScore = () => {
    const weightedScore = areas.reduce((sum, area) => {
      return sum + calculateAreaScore(area) * area.weight
    }, 0)
    return Math.round(weightedScore)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    if (score >= 70) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    if (score >= 70) return "outline"
    return "destructive"
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: { value: number; onChange: (value: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="touch-manipulation">
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const InspectionReport = () => {
    const overallScore = calculateOverallScore()
    const totalPhotos = areas.reduce(
      (sum, area) => sum + area.items.reduce((itemSum, item) => itemSum + item.photos.length, 0),
      0,
    )

    return (
      <div className="space-y-6 p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Quick Inspection Report</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2 text-indigo-600">{overallScore}%</div>
            <div className="text-lg font-medium text-gray-700">Overall Score</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Inspector:</strong> {inspectorInfo.inspectorName}
              </div>
              <div>
                <strong>Date:</strong> {inspectorInfo.date}
              </div>
              <div>
                <strong>Facility:</strong> {inspectorInfo.facilityName}
              </div>
              <div>
                <strong>Shift:</strong> {inspectorInfo.shift}
              </div>
              <div>
                <strong>Team:</strong> {inspectorInfo.cleaningTeam}
              </div>
              <div>
                <strong>Photos:</strong> {totalPhotos}
              </div>
            </div>
          </CardContent>
        </Card>

        {areas.map((area) => {
          const areaScore = calculateAreaScore(area)
          return (
            <Card key={area.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{area.name}</CardTitle>
                  <Badge variant={getScoreBadgeVariant(areaScore)}>{areaScore}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {area.items.map((item) => {
                  const itemScore = calculateItemScore(item)
                  return (
                    <div key={item.id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant={getScoreBadgeVariant(itemScore)} className="ml-2">
                          {itemScore}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                        <div>Clean: {item.cleanliness}/5</div>
                        <div>Organized: {item.organization}/5</div>
                        <div>Protocol: {item.protocol}/5</div>
                      </div>
                      {item.comments && <p className="text-sm text-gray-700 mb-2">{item.comments}</p>}
                      {item.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {item.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo || "/placeholder.svg"}
                              alt={`${item.name} photo ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setShowReport(false)} variant="outline" className="flex-1">
            Back to Form
          </Button>
          <Button onClick={() => setShowComprehensiveReport(true)} variant="outline" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Full Report
          </Button>
          <Button onClick={() => setShowPDFReport(true)} className="flex-1 col-span-2">
            <Download className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>
    )
  }

  if (showPDFReport) {
    return <ProfessionalPDFReport data={{ inspectorInfo, areas }} onBack={() => setShowPDFReport(false)} />
  }

  if (showComprehensiveReport) {
    return <ComprehensiveReport data={{ inspectorInfo, areas }} onBack={() => setShowComprehensiveReport(false)} />
  }

  if (showReport) {
    return <InspectionReport />
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <h1 className="text-xl font-bold text-center">Janitorial Inspection</h1>
        <div className="text-center mt-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            Score: {calculateOverallScore()}%
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 sticky top-16 bg-white z-10">
          <TabsTrigger value="info" className="text-xs">
            Info
          </TabsTrigger>
          <TabsTrigger value="restrooms" className="text-xs">
            Rest
          </TabsTrigger>
          <TabsTrigger value="offices" className="text-xs">
            Office
          </TabsTrigger>
          <TabsTrigger value="common" className="text-xs">
            Common
          </TabsTrigger>
          <TabsTrigger value="exterior" className="text-xs">
            Exterior
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inspector">Inspector Name</Label>
                <Input
                  id="inspector"
                  value={inspectorInfo.inspectorName}
                  onChange={(e) => setInspectorInfo((prev) => ({ ...prev, inspectorName: e.target.value }))}
                  placeholder="Enter inspector name"
                />
              </div>
              <div>
                <Label htmlFor="facility">Facility Name</Label>
                <Input
                  id="facility"
                  value={inspectorInfo.facilityName}
                  onChange={(e) => setInspectorInfo((prev) => ({ ...prev, facilityName: e.target.value }))}
                  placeholder="Enter facility name"
                />
              </div>
              <div>
                <Label htmlFor="date">Inspection Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={inspectorInfo.date}
                  onChange={(e) => setInspectorInfo((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={inspectorInfo.shift}
                  onValueChange={(value) => setInspectorInfo((prev) => ({ ...prev, shift: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="team">Cleaning Team</Label>
                <Input
                  id="team"
                  value={inspectorInfo.cleaningTeam}
                  onChange={(e) => setInspectorInfo((prev) => ({ ...prev, cleaningTeam: e.target.value }))}
                  placeholder="Enter team name/ID"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {areas.map((area) => (
          <TabsContent key={area.id} value={area.id} className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{area.name}</h2>
              <Badge variant={getScoreBadgeVariant(calculateAreaScore(area))}>{calculateAreaScore(area)}%</Badge>
            </div>

            {area.items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <Badge variant={getScoreBadgeVariant(calculateItemScore(item))}>{calculateItemScore(item)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StarRating
                    value={item.cleanliness}
                    onChange={(value) => updateItemRating(area.id, item.id, "cleanliness", value)}
                    label="Cleanliness"
                  />
                  <StarRating
                    value={item.organization}
                    onChange={(value) => updateItemRating(area.id, item.id, "organization", value)}
                    label="Organization"
                  />
                  <StarRating
                    value={item.protocol}
                    onChange={(value) => updateItemRating(area.id, item.id, "protocol", value)}
                    label="Protocol Adherence"
                  />

                  <div>
                    <Label htmlFor={`comments-${item.id}`}>Comments</Label>
                    <Textarea
                      id={`comments-${item.id}`}
                      value={item.comments}
                      onChange={(e) => updateItemComments(area.id, item.id, e.target.value)}
                      placeholder="Add comments or notes..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Photos</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Add Photo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(area.id, item.id, e)}
                      />
                    </div>
                    {item.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {item.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`${item.name} photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              onClick={() => removePhoto(area.id, item.id, index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <Button
          onClick={() => setShowReport(true)}
          className="w-full"
          disabled={!inspectorInfo.inspectorName || !inspectorInfo.facilityName}
        >
          Generate Report
        </Button>
      </div>
    </div>
  )
}
