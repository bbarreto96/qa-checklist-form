"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Printer, CheckCircle, AlertTriangle, Camera } from "lucide-react"
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

interface PDFReportProps {
  data: ReportData
  onBack: () => void
}

export default function PDFReport({ data, onBack }: PDFReportProps) {
  const [additionalComments, setAdditionalComments] = useState("")
  const [cleanerResponse, setCleanerResponse] = useState("")
  const [cleanerName, setCleanerName] = useState("")
  const [inspectorSignature, setInspectorSignature] = useState("")
  const [cleanerSignature, setCleanerSignature] = useState("")

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
    const needsImprovement: {
      area: string
      item: string
      score: number
      issues: string[]
      comments: string
      photos: string[]
    }[] = []

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
          needsImprovement.push({
            area: area.name,
            item: item.name,
            score,
            issues,
            comments: item.comments,
            photos: item.photos,
          })
        }
      })
    })

    return { excellent, needsImprovement }
  }

  const { excellent, needsImprovement } = getPerformanceCategories()
  const overallScore = calculateOverallScore()

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    if (score >= 70) return "text-orange-600"
    return "text-red-600"
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
    alert("PDF export functionality would be implemented here using a PDF library like jsPDF or react-pdf")
  }

  return (
    <div className="bg-white">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .page-break-avoid { page-break-inside: avoid; }
          body { 
            font-size: 11px; 
            line-height: 1.3;
            color: #000;
          }
          .print-page {
            width: 8.5in;
            min-height: 11in;
            margin: 0;
            padding: 0.5in;
            box-sizing: border-box;
          }
          .print-header {
            border-bottom: 2px solid #000;
            margin-bottom: 0.3in;
            padding-bottom: 0.2in;
          }
          .score-circle {
            width: 80px;
            height: 80px;
            border: 3px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            min-height: 30px;
            margin-top: 10px;
          }
        }
        @media screen {
          .print-page {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
        }
      `}</style>

      {/* Action Buttons */}
      <div className="no-print sticky top-0 bg-white border-b z-10 p-4 flex justify-between items-center">
        <Button onClick={onBack} variant="outline">
          ← Back to Checklist
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Page 1: Summary Report */}
      <div className="print-page">
        {/* Header */}
        <div className="print-header">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">JANITORIAL INSPECTION REPORT</h1>
              <p className="text-sm text-gray-600">Quality Assurance Summary</p>
            </div>
            <div className="text-right text-sm">
              <div>Report ID: JIR-{Date.now().toString().slice(-8)}</div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Facility Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Facility:</strong> {data.inspectorInfo.facilityName}
            </div>
            <div>
              <strong>Inspector:</strong> {data.inspectorInfo.inspectorName}
            </div>
            <div>
              <strong>Date:</strong> {new Date(data.inspectorInfo.date).toLocaleDateString()}
            </div>
            <div>
              <strong>Team:</strong> {data.inspectorInfo.cleaningTeam}
            </div>
            <div>
              <strong>Shift:</strong> {data.inspectorInfo.shift}
            </div>
            <div>
              <strong>Areas Inspected:</strong> {data.areas.length}
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Overall Performance</h2>
            <div className="flex items-center gap-4">
              <div className="score-circle">
                <span className={getScoreColor(overallScore)}>{overallScore}%</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{getPerformanceLevel(overallScore)}</div>
                <div className="text-sm text-gray-600">Performance Level</div>
              </div>
            </div>
          </div>

          {/* Area Scores */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {data.areas.map((area) => {
              const areaScore = calculateAreaScore(area)
              return (
                <div key={area.id} className="text-center p-3 border rounded page-break-avoid">
                  <div className="text-sm font-medium mb-1">{area.name}</div>
                  <div className={cn("text-xl font-bold", getScoreColor(areaScore))}>{areaScore}%</div>
                  <div className="text-xs text-gray-600">{getPerformanceLevel(areaScore)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Areas of Excellence */}
          <div className="page-break-avoid">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Areas of Excellence
            </h3>
            {excellent.length > 0 ? (
              <div className="space-y-2">
                {excellent.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded">
                    <div>
                      <div className="font-medium">{item.item}</div>
                      <div className="text-xs text-gray-600">{item.area}</div>
                    </div>
                    <div className="font-bold text-green-600">{item.score}%</div>
                  </div>
                ))}
                {excellent.length > 6 && (
                  <div className="text-xs text-gray-500">+ {excellent.length - 6} more excellent areas</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No areas achieved excellence level (90%+)</p>
            )}
          </div>

          {/* Areas Needing Improvement */}
          <div className="page-break-avoid">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Priority Improvements
            </h3>
            {needsImprovement.length > 0 ? (
              <div className="space-y-2">
                {needsImprovement.slice(0, 6).map((item, index) => (
                  <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-400">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">{item.item}</div>
                      <div className="font-bold text-red-600">{item.score}%</div>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">{item.area}</div>
                    {item.issues.length > 0 && (
                      <div className="text-xs text-red-600">Issues: {item.issues.join(", ")}</div>
                    )}
                  </div>
                ))}
                {needsImprovement.length > 6 && (
                  <div className="text-xs text-gray-500">+ {needsImprovement.length - 6} more areas need attention</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">All areas meet acceptable standards</p>
            )}
          </div>
        </div>

        {/* Inspector Comments */}
        <div className="mb-6 page-break-avoid">
          <h3 className="text-lg font-bold mb-3">Inspector Comments & Recommendations</h3>
          <div className="border rounded p-3 min-h-[80px] bg-gray-50">
            <Textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Additional observations, recommendations, or action items..."
              className="border-0 bg-transparent resize-none min-h-[60px] text-sm"
            />
          </div>
        </div>

        {/* Cleaner Response */}
        <div className="mb-6 page-break-avoid">
          <h3 className="text-lg font-bold mb-3">Cleaner Response & Action Plan</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-sm font-medium">Cleaner Name:</Label>
              <Input
                value={cleanerName}
                onChange={(e) => setCleanerName(e.target.value)}
                className="mt-1 text-sm"
                placeholder="Enter cleaner name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Response Date:</Label>
              <Input type="date" className="mt-1 text-sm" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="border rounded p-3 min-h-[80px] bg-gray-50">
            <Textarea
              value={cleanerResponse}
              onChange={(e) => setCleanerResponse(e.target.value)}
              placeholder="Acknowledge findings and describe corrective actions to be taken..."
              className="border-0 bg-transparent resize-none min-h-[60px] text-sm"
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 page-break-avoid">
          <div>
            <Label className="text-sm font-bold">Inspector Signature:</Label>
            <div className="signature-line mt-2 flex items-end">
              <Input
                value={inspectorSignature}
                onChange={(e) => setInspectorSignature(e.target.value)}
                className="border-0 border-b border-black rounded-none bg-transparent text-sm"
                placeholder="Digital signature"
              />
            </div>
            <div className="text-xs mt-1">
              {data.inspectorInfo.inspectorName} - {new Date().toLocaleDateString()}
            </div>
          </div>
          <div>
            <Label className="text-sm font-bold">Cleaner Acknowledgment:</Label>
            <div className="signature-line mt-2 flex items-end">
              <Input
                value={cleanerSignature}
                onChange={(e) => setCleanerSignature(e.target.value)}
                className="border-0 border-b border-black rounded-none bg-transparent text-sm"
                placeholder="Digital signature"
              />
            </div>
            <div className="text-xs mt-1">{cleanerName || "________________"} - Date: ________________</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
          <p>
            This report summarizes the janitorial inspection findings. Detailed breakdowns available on following pages.
          </p>
          <p>For questions or clarifications, contact the Quality Assurance Department.</p>
        </div>
      </div>

      {/* Additional Pages for Areas of Concern */}
      {needsImprovement.length > 0 && (
        <div className="page-break print-page">
          <div className="print-header">
            <h1 className="text-2xl font-bold mb-2">DETAILED ISSUE ANALYSIS</h1>
            <p className="text-sm text-gray-600 mb-4">Areas Requiring Immediate Attention</p>
            <div className="text-sm">
              <strong>Facility:</strong> {data.inspectorInfo.facilityName} |<strong> Inspector:</strong>{" "}
              {data.inspectorInfo.inspectorName} |<strong> Date:</strong>{" "}
              {new Date(data.inspectorInfo.date).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-6">
            {needsImprovement.map((item, index) => (
              <div key={index} className="page-break-avoid border-l-4 border-red-400 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{item.item}</h3>
                    <p className="text-sm text-gray-600">{item.area}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{item.score}%</div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Identified Issues:</h4>
                    <ul className="text-sm space-y-1">
                      {item.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {issue} concerns identified
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions:</h4>
                    <ul className="text-sm space-y-1">
                      {item.issues.includes("Cleanliness") && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Increase cleaning frequency and thoroughness
                        </li>
                      )}
                      {item.issues.includes("Organization") && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Improve organization and storage systems
                        </li>
                      )}
                      {item.issues.includes("Protocol Adherence") && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Review and retrain on cleaning protocols
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Comments */}
                {item.comments && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Inspector Notes:</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{item.comments}</p>
                  </div>
                )}

                {/* Photos */}
                {item.photos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Evidence Photos ({item.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {item.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="page-break-avoid">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`${item.item} evidence ${photoIndex + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <p className="text-xs text-gray-600 mt-1 text-center">
                            Photo {photoIndex + 1} - {item.item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Level */}
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-red-800">Priority Level: </span>
                      <span className="font-bold text-red-600">
                        {item.score < 50 ? "URGENT" : item.score < 70 ? "HIGH" : "MEDIUM"}
                      </span>
                    </div>
                    <div className="text-sm text-red-600">
                      Target completion: {item.score < 50 ? "24 hours" : item.score < 70 ? "3 days" : "1 week"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200 page-break-avoid">
            <h3 className="font-bold text-blue-800 mb-2">Summary of Required Actions</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {needsImprovement.filter((item) => item.score < 50).length}
                </div>
                <div className="text-xs text-gray-600">Urgent Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {needsImprovement.filter((item) => item.score >= 50 && item.score < 70).length}
                </div>
                <div className="text-xs text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {needsImprovement.filter((item) => item.score >= 70).length}
                </div>
                <div className="text-xs text-gray-600">Medium Priority</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
