"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  Building,
  Camera,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ReportData {
  inspectorInfo: {
    inspectorName: string
    facilityName: string
    date: string
    shift: string
    cleaningTeam: string
  }
  areas: InspectionArea[]
}

interface ComprehensiveReportProps {
  data: ReportData
  onBack: () => void
}

export default function ComprehensiveReport({ data, onBack }: ComprehensiveReportProps) {
  const [additionalComments, setAdditionalComments] = useState("")
  const [cleanerResponse, setCleanerResponse] = useState("")
  const [cleanerName, setCleanerName] = useState("")
  const [cleanerSignature, setCleanerSignature] = useState("")
  const [inspectorSignature, setInspectorSignature] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")

  // Calculate scores and performance metrics
  const calculateItemScore = (item: InspectionItem) => {
    return Math.round(((item.cleanliness + item.organization + item.protocol) / 3) * 20)
  }

  const calculateAreaScore = (area: InspectionArea) => {
    const totalScore = area.items.reduce((sum, item) => sum + calculateItemScore(item), 0)
    return Math.round(totalScore / area.items.length)
  }

  const calculateOverallScore = () => {
    const weightedScore = data.areas.reduce((sum, area) => {
      return sum + calculateAreaScore(area) * area.weight
    }, 0)
    return Math.round(weightedScore)
  }

  // Categorize performance areas
  const getPerformanceCategories = () => {
    const excellent: { area: string; item: string; score: number }[] = []
    const needsImprovement: { area: string; item: string; score: number; issues: string[] }[] = []
    const satisfactory: { area: string; item: string; score: number }[] = []

    data.areas.forEach((area) => {
      area.items.forEach((item) => {
        const score = calculateItemScore(item)
        const issues: string[] = []

        if (item.cleanliness <= 2) issues.push("Cleanliness")
        if (item.organization <= 2) issues.push("Organization")
        if (item.protocol <= 2) issues.push("Protocol Adherence")

        if (score >= 90) {
          excellent.push({ area: area.name, item: item.name, score })
        } else if (score < 70 || issues.length > 0) {
          needsImprovement.push({ area: area.name, item: item.name, score, issues })
        } else {
          satisfactory.push({ area: area.name, item: item.name, score })
        }
      })
    })

    return { excellent, needsImprovement, satisfactory }
  }

  const { excellent, needsImprovement, satisfactory } = getPerformanceCategories()
  const overallScore = calculateOverallScore()
  const totalPhotos = data.areas.reduce(
    (sum, area) => sum + area.items.reduce((itemSum, item) => itemSum + item.photos.length, 0),
    0,
  )

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

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Satisfactory"
    return "Needs Improvement"
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // In a real implementation, you would use a PDF library like jsPDF or react-pdf
    alert("PDF export functionality would be implemented here using a PDF library")
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { font-size: 12px; }
          .print-header { 
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            background: white; 
            border-bottom: 2px solid #000; 
            padding: 10px; 
          }
        }
      `}</style>

      {/* Header - Action Buttons */}
      <div className="no-print sticky top-0 bg-white border-b z-10 p-4 flex justify-between items-center">
        <Button onClick={onBack} variant="outline">
          ← Back to Checklist
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <div className="print-header p-6 border-b-2 border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JANITORIAL INSPECTION REPORT</h1>
          <p className="text-lg text-gray-600">Quality Assurance & Performance Evaluation</p>
        </div>

        {/* Report Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={cn("text-4xl font-bold mb-2", getScoreColor(overallScore))}>{overallScore}%</div>
              <div className="text-lg font-medium text-gray-700">Overall Score</div>
              <Badge variant={getScoreBadgeVariant(overallScore)} className="mt-2">
                {getPerformanceLevel(overallScore)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 mb-2">{data.areas.length}</div>
              <div className="text-sm text-gray-600">Areas Inspected</div>
              <div className="text-2xl font-bold text-gray-700 mb-2 mt-2">
                {data.areas.reduce((sum, area) => sum + area.items.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Items Evaluated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 mb-2">{totalPhotos}</div>
              <div className="text-sm text-gray-600">Photos Attached</div>
              <div className="text-2xl font-bold text-green-600 mb-2 mt-2">{excellent.length}</div>
              <div className="text-sm text-gray-600">Excellent Items</div>
            </div>
          </div>
        </div>

        {/* Inspection Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Facility Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Facility:</span>
                <span>{data.inspectorInfo.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cleaning Team:</span>
                <span>{data.inspectorInfo.cleaningTeam}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shift:</span>
                <span className="capitalize">{data.inspectorInfo.shift}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Inspection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Inspector:</span>
                <span>{data.inspectorInfo.inspectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(data.inspectorInfo.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Performance Summary
        </h2>

        {/* Area Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.areas.map((area) => {
            const areaScore = calculateAreaScore(area)
            return (
              <Card key={area.id}>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium text-sm mb-2">{area.name}</h3>
                  <div className={cn("text-2xl font-bold mb-1", getScoreColor(areaScore))}>{areaScore}%</div>
                  <Badge variant={getScoreBadgeVariant(areaScore)} className="text-xs">
                    {getPerformanceLevel(areaScore)}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Areas of Excellence */}
        {excellent.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Areas of Excellence (90%+ Performance)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {excellent.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.item}</div>
                      <div className="text-sm text-gray-600">{item.area}</div>
                    </div>
                    <Badge variant="default">{item.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Areas Needing Improvement */}
        {needsImprovement.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Areas Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsImprovement.map((item, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{item.item}</div>
                        <div className="text-sm text-gray-600">{item.area}</div>
                      </div>
                      <Badge variant="destructive">{item.score}%</Badge>
                    </div>
                    {item.issues.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Issues: </span>
                        {item.issues.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Area Breakdown */}
        <div className="print-break">
          <h2 className="text-2xl font-bold mb-6">Detailed Inspection Results</h2>
          {data.areas.map((area) => (
            <Card key={area.id} className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{area.name}</CardTitle>
                  <Badge variant={getScoreBadgeVariant(calculateAreaScore(area))} className="text-lg px-3 py-1">
                    {calculateAreaScore(area)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {area.items.map((item) => {
                    const itemScore = calculateItemScore(item)
                    return (
                      <div key={item.id} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-lg">{item.name}</h4>
                          <Badge variant={getScoreBadgeVariant(itemScore)}>{itemScore}%</Badge>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">Cleanliness</div>
                            <div className="flex justify-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-4 h-4",
                                    star <= item.cleanliness ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">Organization</div>
                            <div className="flex justify-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-4 h-4",
                                    star <= item.organization ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">Protocol</div>
                            <div className="flex justify-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-4 h-4",
                                    star <= item.protocol ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Comments */}
                        {item.comments && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Inspector Comments:</div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{item.comments}</p>
                          </div>
                        )}

                        {/* Photos */}
                        {item.photos.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              Evidence Photos ({item.photos.length})
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {item.photos.map((photo, photoIndex) => (
                                <img
                                  key={photoIndex}
                                  src={photo || "/placeholder.svg"}
                                  alt={`${item.name} evidence ${photoIndex + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inspector Additional Comments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inspector Additional Comments & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Add any additional observations, recommendations, or action items..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Action Items & Follow-up */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Action Items & Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="followup-date">Recommended Follow-up Date</Label>
              <Input
                id="followup-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {needsImprovement.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Priority Action Items:</Label>
                <ul className="mt-2 space-y-2">
                  {needsImprovement.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-sm">
                        Address {item.issues.join(" and ").toLowerCase()} issues in {item.item} ({item.area})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cleaner Response Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cleaner Response & Acknowledgment</CardTitle>
            <p className="text-sm text-gray-600">
              This section should be completed by the cleaning team member responsible for the inspected areas.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cleaner-name">Cleaner Name</Label>
              <Input
                id="cleaner-name"
                value={cleanerName}
                onChange={(e) => setCleanerName(e.target.value)}
                placeholder="Enter cleaner's full name"
              />
            </div>

            <div>
              <Label htmlFor="cleaner-response">Response to Inspection Findings</Label>
              <Textarea
                id="cleaner-response"
                value={cleanerResponse}
                onChange={(e) => setCleanerResponse(e.target.value)}
                placeholder="Acknowledge findings, explain any issues, and describe corrective actions to be taken..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Signatures & Acknowledgment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inspector-signature">Inspector Signature</Label>
                  <Input
                    id="inspector-signature"
                    value={inspectorSignature}
                    onChange={(e) => setInspectorSignature(e.target.value)}
                    placeholder="Digital signature or printed name"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <div>Inspector: {data.inspectorInfo.inspectorName}</div>
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cleaner-signature">Cleaner Signature</Label>
                  <Input
                    id="cleaner-signature"
                    value={cleanerSignature}
                    onChange={(e) => setCleanerSignature(e.target.value)}
                    placeholder="Digital signature or printed name"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <div>Cleaner: {cleanerName || "___________________"}</div>
                  <div>Date: ___________________</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>This report was generated automatically from the janitorial inspection checklist.</p>
          <p>
            Report ID: JIR-{Date.now().toString().slice(-8)} | Generated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
