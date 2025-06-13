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

interface ProfessionalPDFReportProps {
  data: ReportData
  onBack: () => void
}

export default function ProfessionalPDFReport({ data, onBack }: ProfessionalPDFReportProps) {
  const [additionalComments, setAdditionalComments] = useState("")
  const [cleanerResponse, setCleanerResponse] = useState("")
  const [cleanerName, setCleanerName] = useState("")
  const [inspectorSignature, setInspectorSignature] = useState("")
  const [cleanerSignature, setCleanerSignature] = useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  // Generate PDF using jsPDF (simulated with advanced HTML/CSS)
  const generatePDF = async () => {
    setIsGeneratingPDF(true)

    try {
      // Create a new window with optimized PDF content
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (!printWindow) {
        alert("Please allow popups to generate PDF")
        setIsGeneratingPDF(false)
        return
      }

      const reportHTML = generateOptimizedPDFHTML()
      printWindow.document.write(reportHTML)
      printWindow.document.close()

      // Wait for images to load, then trigger print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
        setIsGeneratingPDF(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
      setIsGeneratingPDF(false)
    }
  }

  const generateOptimizedPDFHTML = () => {
    const reportId = `JIR-${Date.now().toString().slice(-8)}`
    const currentDate = new Date().toLocaleDateString()

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Janitorial Inspection Report - ${data.inspectorInfo.facilityName}</title>
      <meta charset="UTF-8">
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: 'Arial', sans-serif; 
          font-size: 10px; 
          line-height: 1.3; 
          color: #000;
          background: white;
        }
        
        .page { 
          width: 8.5in; 
          height: 11in; 
          margin: 0; 
          padding: 0.4in; 
          page-break-after: always;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .page:last-child { 
          page-break-after: avoid; 
        }
        
        .header { 
          border-bottom: 3px solid #000; 
          margin-bottom: 15px; 
          padding-bottom: 12px; 
          page-break-inside: avoid;
        }
        
        .title { 
          font-size: 20px; 
          font-weight: bold; 
          text-align: center; 
          margin-bottom: 4px; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .subtitle { 
          font-size: 12px; 
          text-align: center; 
          color: #666; 
          margin-bottom: 12px; 
        }
        
        .header-info { 
          display: grid; 
          grid-template-columns: 1fr auto; 
          gap: 20px; 
          align-items: start;
        }
        
        .facility-info { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 8px; 
          font-size: 9px;
        }
        
        .report-meta {
          text-align: right;
          font-size: 8px;
          color: #666;
        }
        
        .performance-overview {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 20px;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        
        .score-display {
          text-align: center;
          min-width: 120px;
        }
        
        .score-circle { 
          width: 90px; 
          height: 90px; 
          border: 4px solid #333; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 24px; 
          font-weight: bold; 
          margin: 0 auto 8px;
          background: white;
        }
        
        .score-label {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .performance-level {
          font-size: 9px;
          color: #666;
        }
        
        .area-scores { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 8px; 
        }
        
        .area-score { 
          text-align: center; 
          padding: 8px 4px; 
          border: 1px solid #ddd; 
          border-radius: 4px; 
          background: #f9f9f9;
          page-break-inside: avoid;
        }
        
        .area-name {
          font-size: 8px;
          font-weight: bold;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .area-score-value {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .area-level {
          font-size: 7px;
          color: #666;
        }
        
        .performance-highlights { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 12px; 
          margin: 15px 0;
          page-break-inside: avoid;
        }
        
        .highlight-section { 
          border: 1px solid #ddd; 
          border-radius: 6px; 
          overflow: hidden;
          background: white;
        }
        
        .highlight-header { 
          padding: 8px 10px; 
          font-size: 10px; 
          font-weight: bold; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
        }
        
        .excellent-header { 
          background: #dcfce7; 
          color: #166534; 
          border-bottom: 1px solid #bbf7d0;
        }
        
        .improvement-header { 
          background: #fee2e2; 
          color: #991b1b; 
          border-bottom: 1px solid #fecaca;
        }
        
        .highlight-content {
          padding: 8px 10px;
          max-height: 120px;
          overflow: hidden;
        }
        
        .highlight-item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 4px 6px; 
          margin: 2px 0; 
          border-radius: 3px; 
          font-size: 8px;
        }
        
        .excellent-item { 
          background: #f0fdf4; 
          border-left: 2px solid #22c55e; 
        }
        
        .improvement-item { 
          background: #fef2f2; 
          border-left: 2px solid #ef4444; 
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-name {
          font-weight: bold;
          line-height: 1.2;
        }
        
        .item-area {
          color: #666;
          font-size: 7px;
        }
        
        .item-issues {
          color: #dc2626;
          font-size: 7px;
          margin-top: 1px;
        }
        
        .item-score {
          font-weight: bold;
          font-size: 9px;
        }
        
        .excellent-score { color: #16a34a; }
        .improvement-score { color: #dc2626; }
        
        .comments-section { 
          margin: 12px 0; 
          page-break-inside: avoid;
        }
        
        .section-title { 
          font-size: 11px; 
          font-weight: bold; 
          margin-bottom: 6px; 
          color: #333;
        }
        
        .comments-box { 
          border: 1px solid #ddd; 
          border-radius: 4px; 
          padding: 8px; 
          min-height: 50px; 
          background: #f9f9f9;
          font-size: 9px;
          line-height: 1.4;
        }
        
        .response-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 12px 0;
          page-break-inside: avoid;
        }
        
        .response-info {
          font-size: 8px;
          margin-bottom: 4px;
        }
        
        .signature-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-top: auto;
          padding-top: 15px;
          page-break-inside: avoid;
        }
        
        .signature-block {
          text-align: center;
        }
        
        .signature-label { 
          font-size: 9px; 
          font-weight: bold; 
          margin-bottom: 4px; 
        }
        
        .signature-line { 
          border-bottom: 1px solid #000; 
          height: 25px; 
          margin: 8px 0; 
          display: flex;
          align-items: end;
          padding: 0 4px;
          font-size: 9px;
        }
        
        .signature-info { 
          font-size: 7px; 
          color: #666; 
          margin-top: 4px;
        }
        
        .footer { 
          text-align: center; 
          font-size: 7px; 
          color: #666; 
          margin-top: 12px; 
          padding-top: 8px; 
          border-top: 1px solid #eee; 
        }
        
        /* Detail Pages */
        .detail-page {
          page-break-before: always;
        }
        
        .detail-header {
          border-bottom: 2px solid #dc2626;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        
        .detail-title {
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 4px;
        }
        
        .detail-subtitle {
          font-size: 11px;
          color: #666;
        }
        
        .issue-block {
          margin: 15px 0;
          border: 1px solid #dc2626;
          border-radius: 6px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        
        .issue-header {
          background: #fee2e2;
          padding: 10px;
          border-bottom: 1px solid #dc2626;
        }
        
        .issue-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .issue-name {
          font-size: 14px;
          font-weight: bold;
          color: #dc2626;
        }
        
        .issue-score-large {
          font-size: 20px;
          font-weight: bold;
          color: #dc2626;
        }
        
        .issue-location {
          font-size: 9px;
          color: #666;
        }
        
        .issue-content {
          padding: 10px;
        }
        
        .issue-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .detail-section-title {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 6px;
          color: #333;
        }
        
        .issue-list {
          list-style: none;
          padding: 0;
        }
        
        .issue-list li {
          font-size: 8px;
          margin: 3px 0;
          padding-left: 12px;
          position: relative;
        }
        
        .issue-list li:before {
          content: "•";
          color: #dc2626;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .action-list li:before {
          color: #2563eb;
        }
        
        .inspector-notes {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 8px;
          margin: 8px 0;
          font-size: 8px;
          line-height: 1.4;
        }
        
        .photo-section {
          margin: 10px 0;
        }
        
        .photo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 6px;
        }
        
        .photo-item {
          text-align: center;
        }
        
        .photo-img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .photo-caption {
          font-size: 7px;
          color: #666;
          margin-top: 2px;
        }
        
        .priority-box {
          background: #fef2f2;
          border: 1px solid #dc2626;
          border-radius: 4px;
          padding: 8px;
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .priority-label {
          font-size: 9px;
          font-weight: bold;
          color: #dc2626;
        }
        
        .priority-timeline {
          font-size: 8px;
          color: #666;
        }
        
        .summary-box {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          padding: 12px;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        
        .summary-title {
          font-size: 11px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 7px;
          color: #666;
        }
        
        .urgent { color: #dc2626; }
        .high { color: #ea580c; }
        .medium { color: #eab308; }
        
        /* Print Optimizations */
        @media print {
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
          }
          .page { 
            margin: 0; 
            box-shadow: none;
          }
          .no-print { 
            display: none !important; 
          }
        }
        
        @page {
          size: letter;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <!-- Page 1: Executive Summary -->
      <div class="page">
        <div class="header">
          <div class="title">Janitorial Inspection Report</div>
          <div class="subtitle">Quality Assurance Executive Summary</div>
          <div class="header-info">
            <div class="facility-info">
              <div><strong>Facility:</strong> ${data.inspectorInfo.facilityName}</div>
              <div><strong>Inspector:</strong> ${data.inspectorInfo.inspectorName}</div>
              <div><strong>Date:</strong> ${new Date(data.inspectorInfo.date).toLocaleDateString()}</div>
              <div><strong>Team:</strong> ${data.inspectorInfo.cleaningTeam}</div>
              <div><strong>Shift:</strong> ${data.inspectorInfo.shift}</div>
              <div><strong>Areas:</strong> ${data.areas.length} inspected</div>
            </div>
            <div class="report-meta">
              <div><strong>Report ID:</strong> ${reportId}</div>
              <div><strong>Generated:</strong> ${currentDate}</div>
              <div><strong>Status:</strong> ${overallScore >= 90 ? "Excellent" : overallScore >= 70 ? "Satisfactory" : "Needs Attention"}</div>
            </div>
          </div>
        </div>

        <div class="performance-overview">
          <div class="score-display">
            <div class="score-circle" style="color: ${overallScore >= 90 ? "#16a34a" : overallScore >= 70 ? "#eab308" : "#dc2626"};">
              ${overallScore}%
            </div>
            <div class="score-label">Overall Performance</div>
            <div class="performance-level">${getPerformanceLevel(overallScore)}</div>
          </div>
          
          <div class="area-scores">
            ${data.areas
              .map((area) => {
                const areaScore = calculateAreaScore(area)
                const color = areaScore >= 90 ? "#16a34a" : areaScore >= 70 ? "#eab308" : "#dc2626"
                return `
                <div class="area-score">
                  <div class="area-name">${area.name}</div>
                  <div class="area-score-value" style="color: ${color};">${areaScore}%</div>
                  <div class="area-level">${getPerformanceLevel(areaScore)}</div>
                </div>
              `
              })
              .join("")}
          </div>
        </div>

        <div class="performance-highlights">
          <div class="highlight-section">
            <div class="highlight-header excellent-header">
              ✓ Areas of Excellence (${excellent.length})
            </div>
            <div class="highlight-content">
              ${
                excellent.length > 0
                  ? excellent
                      .slice(0, 8)
                      .map(
                        (item) => `
                <div class="highlight-item excellent-item">
                  <div class="item-info">
                    <div class="item-name">${item.item}</div>
                    <div class="item-area">${item.area}</div>
                  </div>
                  <div class="item-score excellent-score">${item.score}%</div>
                </div>
              `,
                      )
                      .join("")
                  : '<div style="font-style: italic; color: #666; padding: 8px; font-size: 8px;">No areas achieved excellence level (90%+)</div>'
              }
              ${excellent.length > 8 ? `<div style="font-size: 7px; color: #666; padding: 4px 8px;">+ ${excellent.length - 8} more excellent areas</div>` : ""}
            </div>
          </div>

          <div class="highlight-section">
            <div class="highlight-header improvement-header">
              ⚠ Priority Improvements (${needsImprovement.length})
            </div>
            <div class="highlight-content">
              ${
                needsImprovement.length > 0
                  ? needsImprovement
                      .slice(0, 8)
                      .map(
                        (item) => `
                <div class="highlight-item improvement-item">
                  <div class="item-info">
                    <div class="item-name">${item.item}</div>
                    <div class="item-area">${item.area}</div>
                    ${item.issues.length > 0 ? `<div class="item-issues">Issues: ${item.issues.join(", ")}</div>` : ""}
                  </div>
                  <div class="item-score improvement-score">${item.score}%</div>
                </div>
              `,
                      )
                      .join("")
                  : '<div style="font-style: italic; color: #666; padding: 8px; font-size: 8px;">All areas meet acceptable standards</div>'
              }
              ${needsImprovement.length > 8 ? `<div style="font-size: 7px; color: #666; padding: 4px 8px;">+ ${needsImprovement.length - 8} more areas need attention</div>` : ""}
            </div>
          </div>
        </div>

        <div class="comments-section">
          <div class="section-title">Inspector Comments & Recommendations</div>
          <div class="comments-box">
            ${additionalComments || "No additional comments provided."}
          </div>
        </div>

        <div class="response-section">
          <div>
            <div class="section-title">Cleaner Response & Action Plan</div>
            <div class="response-info"><strong>Cleaner:</strong> ${cleanerName || "________________"}</div>
            <div class="response-info"><strong>Date:</strong> ${currentDate}</div>
            <div class="comments-box" style="min-height: 40px;">
              ${cleanerResponse || "Response pending..."}
            </div>
          </div>
          <div>
            <div class="section-title">Key Performance Metrics</div>
            <div style="font-size: 8px; line-height: 1.4;">
              <div><strong>Total Items Inspected:</strong> ${data.areas.reduce((sum, area) => sum + area.items.length, 0)}</div>
              <div><strong>Photos Attached:</strong> ${data.areas.reduce((sum, area) => sum + area.items.reduce((itemSum, item) => itemSum + item.photos.length, 0), 0)}</div>
              <div><strong>Areas of Excellence:</strong> ${excellent.length}</div>
              <div><strong>Areas Needing Improvement:</strong> ${needsImprovement.length}</div>
              <div><strong>Urgent Issues:</strong> ${needsImprovement.filter((item) => item.score < 50).length}</div>
              <div><strong>High Priority Issues:</strong> ${needsImprovement.filter((item) => item.score >= 50 && item.score < 70).length}</div>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-label">Inspector Signature</div>
            <div class="signature-line">${inspectorSignature}</div>
            <div class="signature-info">${data.inspectorInfo.inspectorName}<br>${currentDate}</div>
          </div>
          <div class="signature-block">
            <div class="signature-label">Cleaner Acknowledgment</div>
            <div class="signature-line">${cleanerSignature}</div>
            <div class="signature-info">${cleanerName || "________________"}<br>Date: ________________</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Confidential Quality Assurance Document</strong> | For internal use only | Contact QA Department for questions</p>
          <p>This executive summary provides an overview of inspection findings. Detailed analysis available on subsequent pages.</p>
        </div>
      </div>

      ${
        needsImprovement.length > 0
          ? `
      <!-- Detailed Issue Analysis Pages -->
      <div class="page detail-page">
        <div class="detail-header">
          <div class="detail-title">Detailed Issue Analysis</div>
          <div class="detail-subtitle">Areas Requiring Immediate Attention</div>
          <div style="font-size: 9px; margin-top: 8px; color: #666;">
            <strong>Facility:</strong> ${data.inspectorInfo.facilityName} | 
            <strong>Inspector:</strong> ${data.inspectorInfo.inspectorName} | 
            <strong>Date:</strong> ${new Date(data.inspectorInfo.date).toLocaleDateString()}
          </div>
        </div>

        ${needsImprovement
          .map(
            (item) => `
          <div class="issue-block">
            <div class="issue-header">
              <div class="issue-title-row">
                <div>
                  <div class="issue-name">${item.item}</div>
                  <div class="issue-location">${item.area}</div>
                </div>
                <div class="issue-score-large">${item.score}%</div>
              </div>
            </div>
            
            <div class="issue-content">
              <div class="issue-details">
                <div>
                  <div class="detail-section-title">Identified Issues:</div>
                  <ul class="issue-list">
                    ${item.issues.map((issue) => `<li>${issue} concerns identified</li>`).join("")}
                    ${item.issues.length === 0 ? "<li>Performance below acceptable standards</li>" : ""}
                  </ul>
                </div>
                <div>
                  <div class="detail-section-title">Recommended Actions:</div>
                  <ul class="issue-list action-list">
                    ${item.issues.includes("Cleanliness") ? "<li>Increase cleaning frequency and thoroughness</li>" : ""}
                    ${item.issues.includes("Organization") ? "<li>Improve organization and storage systems</li>" : ""}
                    ${item.issues.includes("Protocol Adherence") ? "<li>Review and retrain on cleaning protocols</li>" : ""}
                    ${item.issues.length === 0 ? "<li>Review current procedures and implement improvements</li>" : ""}
                    <li>Schedule follow-up inspection within ${item.score < 50 ? "24 hours" : item.score < 70 ? "3 days" : "1 week"}</li>
                  </ul>
                </div>
              </div>

              ${
                item.comments
                  ? `
                <div>
                  <div class="detail-section-title">Inspector Notes:</div>
                  <div class="inspector-notes">${item.comments}</div>
                </div>
              `
                  : ""
              }

              ${
                item.photos.length > 0
                  ? `
                <div class="photo-section">
                  <div class="detail-section-title">📷 Evidence Photos (${item.photos.length})</div>
                  <div class="photo-grid">
                    ${item.photos
                      .slice(0, 4)
                      .map(
                        (photo, index) => `
                      <div class="photo-item">
                        <img src="${photo}" alt="${item.item} evidence ${index + 1}" class="photo-img" />
                        <div class="photo-caption">Photo ${index + 1} - ${item.item}</div>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                  ${item.photos.length > 4 ? `<div style="font-size: 7px; color: #666; margin-top: 4px;">+ ${item.photos.length - 4} additional photos available</div>` : ""}
                </div>
              `
                  : ""
              }

              <div class="priority-box">
                <div class="priority-label">
                  Priority Level: ${item.score < 50 ? "URGENT" : item.score < 70 ? "HIGH" : "MEDIUM"}
                </div>
                <div class="priority-timeline">
                  Target completion: ${item.score < 50 ? "24 hours" : item.score < 70 ? "3 days" : "1 week"}
                </div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}

        <div class="summary-box">
          <div class="summary-title">Action Items Summary</div>
          <div class="summary-stats">
            <div>
              <div class="stat-value urgent">${needsImprovement.filter((item) => item.score < 50).length}</div>
              <div class="stat-label">Urgent Issues<br>(24 hour response)</div>
            </div>
            <div>
              <div class="stat-value high">${needsImprovement.filter((item) => item.score >= 50 && item.score < 70).length}</div>
              <div class="stat-label">High Priority<br>(3 day response)</div>
            </div>
            <div>
              <div class="stat-value medium">${needsImprovement.filter((item) => item.score >= 70).length}</div>
              <div class="stat-label">Medium Priority<br>(1 week response)</div>
            </div>
          </div>
        </div>
      </div>
      `
          : ""
      }
    </body>
    </html>
    `
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white">
      {/* Print Styles for Preview */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .page-break-avoid { page-break-inside: avoid; }
          body { 
            font-size: 10px; 
            line-height: 1.3;
            color: #000;
            print-color-adjust: exact;
          }
          .print-page {
            width: 8.5in;
            height: 11in;
            margin: 0;
            padding: 0.4in;
            box-sizing: border-box;
            page-break-after: always;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
        }
        @media screen {
          .print-page {
            max-width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            padding: 0.4in;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            background: white;
          }
        }
      `}</style>

      {/* Action Buttons */}
      <div className="no-print sticky top-0 bg-white border-b z-10 p-4 flex justify-between items-center shadow-sm">
        <Button onClick={onBack} variant="outline">
          ← Back to Checklist
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </Button>
          <Button onClick={generatePDF} variant="default" size="sm" disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Page 1: Executive Summary */}
      <div className="print-page">
        {/* Header */}
        <div className="border-b-2 border-black pb-3 mb-4">
          <h1 className="text-xl font-bold text-center mb-1 uppercase tracking-wide">Janitorial Inspection Report</h1>
          <p className="text-sm text-center text-gray-600 mb-3">Quality Assurance Executive Summary</p>

          <div className="flex justify-between items-start">
            <div className="grid grid-cols-3 gap-2 text-xs">
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
                <strong>Areas:</strong> {data.areas.length} inspected
              </div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div>
                <strong>Report ID:</strong> JIR-{Date.now().toString().slice(-8)}
              </div>
              <div>
                <strong>Generated:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong> {getPerformanceLevel(overallScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-5 gap-4 mb-4 page-break-avoid">
          <div className="text-center">
            <div
              className={cn(
                "w-20 h-20 border-4 border-gray-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2",
                getScoreColor(overallScore),
              )}
            >
              {overallScore}%
            </div>
            <div className="text-xs font-bold">Overall Performance</div>
            <div className="text-xs text-gray-600">{getPerformanceLevel(overallScore)}</div>
          </div>

          {data.areas.map((area) => {
            const areaScore = calculateAreaScore(area)
            return (
              <div key={area.id} className="text-center p-2 border rounded bg-gray-50">
                <div className="text-xs font-bold mb-1 leading-tight">{area.name}</div>
                <div className={cn("text-lg font-bold mb-1", getScoreColor(areaScore))}>{areaScore}%</div>
                <div className="text-xs text-gray-600">{getPerformanceLevel(areaScore)}</div>
              </div>
            )
          })}
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-4 page-break-avoid">
          <div className="border rounded overflow-hidden">
            <div className="bg-green-100 text-green-800 p-2 text-xs font-bold flex items-center gap-2 border-b">
              <CheckCircle className="w-4 h-4" />
              Areas of Excellence ({excellent.length})
            </div>
            <div className="p-2 max-h-28 overflow-hidden">
              {excellent.length > 0 ? (
                <div className="space-y-1">
                  {excellent.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-1 bg-green-50 rounded">
                      <div>
                        <div className="font-medium">{item.item}</div>
                        <div className="text-xs text-gray-600">{item.area}</div>
                      </div>
                      <div className="font-bold text-green-600">{item.score}%</div>
                    </div>
                  ))}
                  {excellent.length > 6 && <div className="text-xs text-gray-500">+ {excellent.length - 6} more</div>}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No areas achieved excellence level (90%+)</p>
              )}
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <div className="bg-red-100 text-red-800 p-2 text-xs font-bold flex items-center gap-2 border-b">
              <AlertTriangle className="w-4 h-4" />
              Priority Improvements ({needsImprovement.length})
            </div>
            <div className="p-2 max-h-28 overflow-hidden">
              {needsImprovement.length > 0 ? (
                <div className="space-y-1">
                  {needsImprovement.slice(0, 6).map((item, index) => (
                    <div key={index} className="text-xs p-1 bg-red-50 rounded border-l-2 border-red-400">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{item.item}</div>
                        <div className="font-bold text-red-600">{item.score}%</div>
                      </div>
                      <div className="text-xs text-gray-600">{item.area}</div>
                      {item.issues.length > 0 && (
                        <div className="text-xs text-red-600">Issues: {item.issues.join(", ")}</div>
                      )}
                    </div>
                  ))}
                  {needsImprovement.length > 6 && (
                    <div className="text-xs text-gray-500">+ {needsImprovement.length - 6} more</div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">All areas meet acceptable standards</p>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-3 page-break-avoid">
          <h3 className="text-sm font-bold mb-2">Inspector Comments & Recommendations</h3>
          <div className="border rounded p-2 min-h-[50px] bg-gray-50 text-xs">
            <Textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Additional observations, recommendations, or action items..."
              className="border-0 bg-transparent resize-none min-h-[40px] text-xs"
            />
          </div>
        </div>

        {/* Response Section */}
        <div className="grid grid-cols-2 gap-3 mb-3 page-break-avoid">
          <div>
            <h3 className="text-sm font-bold mb-2">Cleaner Response & Action Plan</h3>
            <div className="text-xs mb-1">
              <Label className="text-xs">Cleaner Name:</Label>
              <Input
                value={cleanerName}
                onChange={(e) => setCleanerName(e.target.value)}
                className="mt-1 text-xs h-6"
                placeholder="Enter cleaner name"
              />
            </div>
            <div className="border rounded p-2 min-h-[40px] bg-gray-50">
              <Textarea
                value={cleanerResponse}
                onChange={(e) => setCleanerResponse(e.target.value)}
                placeholder="Acknowledge findings and describe corrective actions..."
                className="border-0 bg-transparent resize-none min-h-[30px] text-xs"
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2">Key Performance Metrics</h3>
            <div className="text-xs space-y-1">
              <div>
                <strong>Total Items Inspected:</strong> {data.areas.reduce((sum, area) => sum + area.items.length, 0)}
              </div>
              <div>
                <strong>Photos Attached:</strong>{" "}
                {data.areas.reduce(
                  (sum, area) => sum + area.items.reduce((itemSum, item) => itemSum + item.photos.length, 0),
                  0,
                )}
              </div>
              <div>
                <strong>Areas of Excellence:</strong> {excellent.length}
              </div>
              <div>
                <strong>Areas Needing Improvement:</strong> {needsImprovement.length}
              </div>
              <div>
                <strong>Urgent Issues:</strong> {needsImprovement.filter((item) => item.score < 50).length}
              </div>
              <div>
                <strong>High Priority Issues:</strong>{" "}
                {needsImprovement.filter((item) => item.score >= 50 && item.score < 70).length}
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 mt-auto page-break-avoid">
          <div className="text-center">
            <Label className="text-xs font-bold">Inspector Signature</Label>
            <div className="border-b border-black h-6 mt-2 flex items-end px-1">
              <Input
                value={inspectorSignature}
                onChange={(e) => setInspectorSignature(e.target.value)}
                className="border-0 bg-transparent text-xs h-5 p-0"
                placeholder="Digital signature"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data.inspectorInfo.inspectorName}
              <br />
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="text-center">
            <Label className="text-xs font-bold">Cleaner Acknowledgment</Label>
            <div className="border-b border-black h-6 mt-2 flex items-end px-1">
              <Input
                value={cleanerSignature}
                onChange={(e) => setCleanerSignature(e.target.value)}
                className="border-0 bg-transparent text-xs h-5 p-0"
                placeholder="Digital signature"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {cleanerName || "________________"}
              <br />
              Date: ________________
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t">
          <p>
            <strong>Confidential Quality Assurance Document</strong> | For internal use only
          </p>
          <p>
            This executive summary provides an overview of inspection findings. Detailed analysis available on
            subsequent pages.
          </p>
        </div>
      </div>

      {/* Additional Pages for Areas of Concern */}
      {needsImprovement.length > 0 && (
        <div className="print-page">
          <div className="border-b-2 border-red-600 pb-2 mb-4">
            <h1 className="text-lg font-bold text-red-600 mb-1">Detailed Issue Analysis</h1>
            <p className="text-sm text-gray-600">Areas Requiring Immediate Attention</p>
            <div className="text-xs text-gray-600 mt-2">
              <strong>Facility:</strong> {data.inspectorInfo.facilityName} |<strong>Inspector:</strong>{" "}
              {data.inspectorInfo.inspectorName} |<strong>Date:</strong>{" "}
              {new Date(data.inspectorInfo.date).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-4">
            {needsImprovement.map((item, index) => (
              <div key={index} className="border border-red-400 rounded page-break-avoid">
                <div className="bg-red-100 p-2 border-b border-red-400">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-red-800">{item.item}</h3>
                      <p className="text-xs text-gray-600">{item.area}</p>
                    </div>
                    <div className="text-xl font-bold text-red-600">{item.score}%</div>
                  </div>
                </div>

                <div className="p-2">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <h4 className="text-xs font-bold mb-1">Identified Issues:</h4>
                      <ul className="text-xs space-y-1">
                        {item.issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {issue} concerns identified
                          </li>
                        ))}
                        {item.issues.length === 0 && (
                          <li className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            Performance below acceptable standards
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold mb-1">Recommended Actions:</h4>
                      <ul className="text-xs space-y-1">
                        {item.issues.includes("Cleanliness") && (
                          <li className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            Increase cleaning frequency and thoroughness
                          </li>
                        )}
                        {item.issues.includes("Organization") && (
                          <li className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            Improve organization and storage systems
                          </li>
                        )}
                        {item.issues.includes("Protocol Adherence") && (
                          <li className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            Review and retrain on cleaning protocols
                          </li>
                        )}
                        <li className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Schedule follow-up inspection within{" "}
                          {item.score < 50 ? "24 hours" : item.score < 70 ? "3 days" : "1 week"}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {item.comments && (
                    <div className="mb-2">
                      <h4 className="text-xs font-bold mb-1">Inspector Notes:</h4>
                      <p className="text-xs bg-gray-50 p-2 rounded border">{item.comments}</p>
                    </div>
                  )}

                  {item.photos.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-bold mb-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Evidence Photos ({item.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {item.photos.slice(0, 4).map((photo, photoIndex) => (
                          <div key={photoIndex} className="text-center">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`${item.item} evidence ${photoIndex + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Photo {photoIndex + 1} - {item.item}
                            </p>
                          </div>
                        ))}
                      </div>
                      {item.photos.length > 4 && (
                        <div className="text-xs text-gray-500 mt-1">
                          + {item.photos.length - 4} additional photos available
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-red-50 p-2 rounded border border-red-200 flex justify-between items-center">
                    <div className="text-xs font-bold text-red-800">
                      Priority Level: {item.score < 50 ? "URGENT" : item.score < 70 ? "HIGH" : "MEDIUM"}
                    </div>
                    <div className="text-xs text-gray-600">
                      Target completion: {item.score < 50 ? "24 hours" : item.score < 70 ? "3 days" : "1 week"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 page-break-avoid">
            <h3 className="text-sm font-bold text-blue-800 mb-2">Action Items Summary</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {needsImprovement.filter((item) => item.score < 50).length}
                </div>
                <div className="text-gray-600">
                  Urgent Issues
                  <br />
                  (24 hour response)
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {needsImprovement.filter((item) => item.score >= 50 && item.score < 70).length}
                </div>
                <div className="text-gray-600">
                  High Priority
                  <br />
                  (3 day response)
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {needsImprovement.filter((item) => item.score >= 70).length}
                </div>
                <div className="text-gray-600">
                  Medium Priority
                  <br />
                  (1 week response)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
