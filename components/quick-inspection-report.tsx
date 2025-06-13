"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Download,
	Printer,
	CheckCircle,
	AlertTriangle,
	AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QAStatus = "green" | "yellow" | "red" | "unset";

interface InspectionItem {
	id: string;
	name: string;
	status: QAStatus;
	comments: string;
	photos: string[];
}

interface InspectionArea {
	id: string;
	name: string;
	items: InspectionItem[];
	weight: number;
}

interface WinsEntry {
	id: string;
	description: string;
}

interface ReportData {
	inspectorInfo: {
		inspectorName: string;
		facilityName: string;
		date: string;
		shift: string;
		cleaningTeam: string;
	};
	areas: InspectionArea[];
	wins: WinsEntry[];
	cleanerFeedback: string;
}

interface QuickInspectionReportProps {
	data: ReportData;
	onBack: () => void;
}

export default function QuickInspectionReport({
	data,
	onBack,
}: QuickInspectionReportProps) {
	const [inspectorSignature, setInspectorSignature] = useState("");
	const [cleanerSignature, setCleanerSignature] = useState("");
	const [cleanerName, setCleanerName] = useState("");
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	// Convert QA status to numerical score for calculations
	const getStatusScore = (status: QAStatus): number => {
		switch (status) {
			case "green":
				return 95;
			case "yellow":
				return 75;
			case "red":
				return 50;
			default:
				return 0;
		}
	};

	// Calculate item score based on status
	const calculateItemScore = (item: InspectionItem): number => {
		return getStatusScore(item.status);
	};

	// Calculate area score
	const calculateAreaScore = (area: InspectionArea): number => {
		const validItems = area.items.filter((item) => item.status !== "unset");
		if (validItems.length === 0) return 0;

		const totalScore = validItems.reduce(
			(sum, item) => sum + calculateItemScore(item),
			0
		);
		return Math.round(totalScore / validItems.length);
	};

	// Calculate overall score
	const calculateOverallScore = (): number => {
		let totalWeightedScore = 0;
		let totalWeight = 0;

		data.areas.forEach((area) => {
			const areaScore = calculateAreaScore(area);
			if (areaScore > 0) {
				totalWeightedScore += areaScore * area.weight;
				totalWeight += area.weight;
			}
		});

		return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
	};

	// Get critical issues (items scoring below 70)
	const getCriticalIssues = () => {
		const issues: {
			area: string;
			item: string;
			score: number;
			status: QAStatus;
			comments: string;
		}[] = [];

		data.areas.forEach((area) => {
			area.items.forEach((item) => {
				const score = calculateItemScore(item);
				if (score < 70 && item.status !== "unset") {
					issues.push({
						area: area.name,
						item: item.name,
						score,
						status: item.status,
						comments: item.comments,
					});
				}
			});
		});

		// Sort by score (lowest first) and limit to top 5
		return issues.sort((a, b) => a.score - b.score).slice(0, 5);
	};

	// Get performance level text
	const getPerformanceLevel = (score: number): string => {
		if (score >= 90) return "Excellent";
		if (score >= 80) return "Good";
		if (score >= 70) return "Satisfactory";
		return "Needs Improvement";
	};

	// Get priority action items
	const getPriorityActions = () => {
		const criticalIssues = getCriticalIssues();
		const actions: string[] = [];

		if (criticalIssues.length > 0) {
			const redIssues = criticalIssues.filter(
				(issue) => issue.status === "red"
			);
			const yellowIssues = criticalIssues.filter(
				(issue) => issue.status === "yellow"
			);

			if (redIssues.length > 0) {
				actions.push(
					`Address ${redIssues.length} urgent issue${
						redIssues.length > 1 ? "s" : ""
					} within 24 hours`
				);
			}
			if (yellowIssues.length > 0) {
				actions.push(
					`Follow up on ${yellowIssues.length} attention item${
						yellowIssues.length > 1 ? "s" : ""
					} within 3 days`
				);
			}
		}

		const overallScore = calculateOverallScore();
		if (overallScore < 80) {
			actions.push("Schedule additional training session for cleaning team");
		}

		return actions.slice(0, 3); // Limit to 3 actions
	};

	const handlePrint = () => {
		window.print();
	};

	const generatePDF = async () => {
		setIsGeneratingPDF(true);

		try {
			// Create a new window with the report content
			const printWindow = window.open("", "_blank");
			if (!printWindow) {
				alert("Please allow popups to generate PDF");
				setIsGeneratingPDF(false);
				return;
			}

			const reportHTML = generateReportHTML();
			printWindow.document.write(reportHTML);
			printWindow.document.close();

			// Wait for content to load, then trigger print
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
				setIsGeneratingPDF(false);
			}, 1000);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("Error generating PDF. Please try again.");
			setIsGeneratingPDF(false);
		}
	};

	const generateReportHTML = () => {
		const reportId = `QIR-${Date.now().toString().slice(-8)}`;
		const currentDate = new Date().toLocaleDateString();
		const overallScore = calculateOverallScore();
		const criticalIssues = getCriticalIssues();
		const priorityActions = getPriorityActions();
		const performanceLevel = getPerformanceLevel(overallScore);

		// Limit content to fit on one page
		const maxCriticalIssues = 4; // Reduced from 5 to ensure fit
		const maxActions = 2; // Reduced from 3 to ensure fit
		const displayedIssues = criticalIssues.slice(0, maxCriticalIssues);
		const displayedActions = priorityActions.slice(0, maxActions);
		const hasMoreIssues = criticalIssues.length > maxCriticalIssues;
		const hasMoreActions = priorityActions.length > maxActions;

		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quick Inspection Summary - ${data.inspectorInfo.facilityName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Page Setup for Letter Size Portrait - Strict Single Page */
        @page {
            size: letter portrait;
            margin: 0.25in;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.2;
            color: #333;
            background: white;
            font-size: 9px;
            height: 10.5in;
            width: 8in;
            overflow: hidden;
        }

        .page-container {
            height: 10.5in;
            width: 8in;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0.1in;
        }

        /* Header Section - Compact */
        .header {
            background: linear-gradient(135deg, #4BAA47 0%, #3d8b40 100%);
            color: white;
            padding: 6px 8px;
            text-align: center;
            border-radius: 3px;
            margin-bottom: 4px;
            flex: 0 0 auto;
            height: 0.8in;
        }

        .header h1 {
            font-size: 14px;
            margin-bottom: 2px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        .header .facility-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 4px;
            font-size: 8px;
        }

        .header .facility-name {
            font-weight: 600;
            font-size: 9px;
        }

        .header .report-meta {
            text-align: right;
            opacity: 0.9;
        }

        /* Performance Overview - Compact */
        .performance-overview {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 3px;
            margin-bottom: 4px;
            flex: 0 0 auto;
            height: 0.9in;
        }

        .score-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 800;
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .score-circle.excellent { background: linear-gradient(135deg, #4BAA47, #22c55e); }
        .score-circle.good { background: linear-gradient(135deg, #eab308, #f59e0b); }
        .score-circle.needs-improvement { background: linear-gradient(135deg, #ef4444, #dc2626); }

        .performance-text {
            text-align: center;
        }

        .performance-level {
            font-size: 12px;
            font-weight: 700;
            color: #474D53;
            margin-bottom: 2px;
        }

        .performance-subtitle {
            font-size: 8px;
            color: #6b7280;
            font-weight: 500;
        }

        /* Critical Issues Section - Compact */
        .critical-issues {
            flex: 1;
            margin-bottom: 3px;
            max-height: 4.5in;
            overflow: hidden;
        }

        .section-title {
            font-size: 10px;
            font-weight: 700;
            color: #474D53;
            margin-bottom: 3px;
            padding-bottom: 2px;
            border-bottom: 1px solid #4BAA47;
        }

        .issues-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 3.8in;
            overflow: hidden;
        }

        .issue-item {
            padding: 4px 6px;
            border-radius: 2px;
            border-left: 3px solid;
            background: white;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .issue-item.urgent {
            border-left-color: #ef4444;
            background: #fef2f2;
        }

        .issue-item.attention {
            border-left-color: #eab308;
            background: #fefce8;
        }

        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1px;
        }

        .issue-location {
            font-weight: 600;
            font-size: 8px;
            color: #374151;
        }

        .issue-score {
            font-size: 7px;
            font-weight: 700;
            padding: 1px 4px;
            border-radius: 8px;
            color: white;
        }

        .issue-score.urgent { background: #ef4444; }
        .issue-score.attention { background: #eab308; }

        .issue-name {
            font-size: 8px;
            color: #4b5563;
            margin-bottom: 1px;
        }

        .issue-comments {
            font-size: 7px;
            color: #6b7280;
            font-style: italic;
            max-height: 0.3in;
            overflow: hidden;
        }

        .more-indicator {
            font-size: 7px;
            color: #6b7280;
            font-style: italic;
            text-align: center;
            margin-top: 2px;
            padding: 2px;
            background: #f3f4f6;
            border-radius: 2px;
        }

        .no-issues {
            text-align: center;
            padding: 8px;
            color: #4BAA47;
            font-weight: 600;
            background: #f0f9ff;
            border-radius: 3px;
            border: 1px dashed #4BAA47;
            font-size: 8px;
        }

        /* Action Items Section - Compact */
        .action-items {
            margin-bottom: 3px;
            flex: 0 0 auto;
            max-height: 1.2in;
            overflow: hidden;
        }

        .actions-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .action-item {
            padding: 3px 6px;
            background: #eff6ff;
            border-left: 2px solid #3b82f6;
            border-radius: 2px;
            font-size: 8px;
            color: #1e40af;
            font-weight: 500;
        }

        .no-actions {
            text-align: center;
            padding: 6px;
            color: #4BAA47;
            font-weight: 600;
            background: #f0f9ff;
            border-radius: 2px;
            font-size: 8px;
        }

        /* Signature Section - Compact */
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 6px;
            background: #f8f9fa;
            border-radius: 3px;
            flex: 0 0 auto;
            height: 0.8in;
        }

        .signature-field {
            text-align: center;
        }

        .signature-label {
            font-size: 7px;
            color: #6b7280;
            margin-bottom: 2px;
            font-weight: 600;
        }

        .signature-line {
            border-bottom: 1px solid #374151;
            height: 16px;
            display: flex;
            align-items: end;
            justify-content: center;
            font-size: 8px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2px;
        }

        .signature-date {
            font-size: 6px;
            color: #6b7280;
        }

        /* Footer - Compact */
        .footer {
            text-align: center;
            font-size: 6px;
            color: #6b7280;
            padding-top: 3px;
            border-top: 1px solid #e5e7eb;
            flex: 0 0 auto;
            height: 0.3in;
        }

        .footer .company {
            font-weight: 600;
            color: #4BAA47;
        }

        /* Print optimizations */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .page-container {
                height: 100vh;
                max-height: none;
            }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <!-- Header Section -->
        <div class="header">
            <h1>QUICK INSPECTION SUMMARY</h1>
            <div class="facility-info">
                <div>
                    <div class="facility-name">${
											data.inspectorInfo.facilityName
										}</div>
                    <div>Inspector: ${data.inspectorInfo.inspectorName}</div>
                </div>
                <div class="report-meta">
                    <div>Report ID: ${reportId}</div>
                    <div>${data.inspectorInfo.date} | ${
			data.inspectorInfo.shift
		}</div>
                </div>
            </div>
        </div>

        <!-- Performance Overview -->
        <div class="performance-overview">
            <div class="score-circle ${
							overallScore >= 90
								? "excellent"
								: overallScore >= 70
								? "good"
								: "needs-improvement"
						}">
                ${overallScore}%
            </div>
            <div class="performance-text">
                <div class="performance-level">${performanceLevel}</div>
                <div class="performance-subtitle">Overall Performance</div>
            </div>
        </div>

        <!-- Critical Issues Section -->
        <div class="critical-issues">
            <div class="section-title">🚨 Critical Issues Requiring Attention</div>
            ${
							criticalIssues.length > 0
								? `
                <div class="issues-list">
                    ${criticalIssues
											.map(
												(issue) => `
                        <div class="issue-item ${
													issue.status === "red" ? "urgent" : "attention"
												}">
                            <div class="issue-header">
                                <span class="issue-location">${
																	issue.area
																}</span>
                                <span class="issue-score ${
																	issue.status === "red"
																		? "urgent"
																		: "attention"
																}">${issue.score}%</span>
                            </div>
                            <div class="issue-name">${issue.item}</div>
                            ${
															issue.comments
																? `<div class="issue-comments">${issue.comments}</div>`
																: ""
														}
                        </div>
                    `
											)
											.join("")}
                </div>
            `
								: `
                <div class="no-issues">
                    ✅ Excellent! No critical issues identified.
                </div>
            `
						}
        </div>

        <!-- Action Items -->
        <div class="action-items">
            <div class="section-title">📋 Priority Actions</div>
            ${
							priorityActions.length > 0
								? `
                <div class="actions-list">
                    ${priorityActions
											.map(
												(action) => `
                        <div class="action-item">• ${action}</div>
                    `
											)
											.join("")}
                </div>
            `
								: `
                <div class="no-actions">
                    ✅ No immediate actions required - maintain current standards
                </div>
            `
						}
        </div>

        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-field">
                <div class="signature-label">Inspector Signature</div>
                <div class="signature-line">${inspectorSignature}</div>
                <div class="signature-date">Date: ${currentDate}</div>
            </div>
            <div class="signature-field">
                <div class="signature-label">Team Member</div>
                <div class="signature-line">${cleanerSignature}</div>
                <div class="signature-date">Name: ${cleanerName}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="company">Element Cleaning Systems</div>
            <div>Quick Inspection Summary | Generated ${currentDate}</div>
        </div>
    </div>
</body>
</html>
        `;
	};

	const overallScore = calculateOverallScore();
	const criticalIssues = getCriticalIssues();
	const priorityActions = getPriorityActions();
	const performanceLevel = getPerformanceLevel(overallScore);

	return (
		<div className="max-w-4xl mx-auto bg-white min-h-screen">
			{/* Action Buttons */}
			<div className="no-print sticky top-0 bg-white border-b z-10 p-4 flex justify-between items-center shadow-sm">
				<Button onClick={onBack} variant="outline">
					← Back to Report Options
				</Button>
				<div className="flex gap-2">
					<Button onClick={handlePrint} variant="outline" size="sm">
						<Printer className="w-4 h-4 mr-2" />
						Print Preview
					</Button>
					<Button
						onClick={generatePDF}
						variant="default"
						size="sm"
						disabled={isGeneratingPDF}
						className="bg-green-600 hover:bg-green-700"
					>
						<Download className="w-4 h-4 mr-2" />
						{isGeneratingPDF ? "Generating..." : "Export Quick PDF"}
					</Button>
				</div>
			</div>

			{/* Report Header */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
				<h1 className="text-3xl font-bold mb-2">Quick Inspection Summary</h1>
				<p className="text-lg opacity-90 mb-4">Element Cleaning Systems</p>
				<div className="flex justify-center items-center gap-4">
					<div
						className={cn(
							"w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold",
							overallScore >= 90
								? "bg-green-500"
								: overallScore >= 70
								? "bg-yellow-500"
								: "bg-red-500"
						)}
					>
						{overallScore}%
					</div>
					<div className="text-left">
						<div className="text-xl font-semibold">{performanceLevel}</div>
						<div className="text-sm opacity-75">Overall Performance</div>
					</div>
				</div>
			</div>

			<div className="p-6 space-y-6">
				{/* Facility Information */}
				<div className="bg-gray-50 p-4 rounded-lg">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<div className="font-semibold text-gray-700">Facility</div>
							<div>{data.inspectorInfo.facilityName}</div>
						</div>
						<div>
							<div className="font-semibold text-gray-700">Inspector</div>
							<div>{data.inspectorInfo.inspectorName}</div>
						</div>
						<div>
							<div className="font-semibold text-gray-700">Date</div>
							<div>{data.inspectorInfo.date}</div>
						</div>
						<div>
							<div className="font-semibold text-gray-700">Shift</div>
							<div>{data.inspectorInfo.shift}</div>
						</div>
					</div>
				</div>

				{/* Critical Issues */}
				<div className="bg-white border rounded-lg p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-red-500" />
						Critical Issues Requiring Attention
					</h2>
					{criticalIssues.length > 0 ? (
						<div className="space-y-3">
							{criticalIssues.map((issue, index) => (
								<div
									key={index}
									className={cn(
										"p-4 rounded-lg border-l-4",
										issue.status === "red"
											? "border-red-500 bg-red-50"
											: "border-yellow-500 bg-yellow-50"
									)}
								>
									<div className="flex justify-between items-start mb-2">
										<div className="font-semibold text-gray-800">
											{issue.area}
										</div>
										<div
											className={cn(
												"px-2 py-1 rounded text-xs font-bold text-white",
												issue.status === "red" ? "bg-red-500" : "bg-yellow-500"
											)}
										>
											{issue.score}%
										</div>
									</div>
									<div className="text-gray-700 mb-1">{issue.item}</div>
									{issue.comments && (
										<div className="text-sm text-gray-600 italic">
											{issue.comments}
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-green-600 font-semibold">
							✅ Excellent! No critical issues identified.
						</div>
					)}
				</div>

				{/* Priority Actions */}
				<div className="bg-white border rounded-lg p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						<CheckCircle className="w-5 h-5 text-blue-500" />
						Priority Actions
					</h2>
					{priorityActions.length > 0 ? (
						<div className="space-y-2">
							{priorityActions.map((action, index) => (
								<div
									key={index}
									className="flex items-start gap-2 p-3 bg-blue-50 rounded border-l-3 border-blue-400"
								>
									<div className="text-blue-600 font-bold">•</div>
									<div className="text-blue-800">{action}</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-6 text-green-600 font-semibold">
							✅ No immediate actions required - maintain current standards
						</div>
					)}
				</div>

				{/* Signatures Section */}
				<div className="bg-gray-50 p-6 rounded-lg">
					<h2 className="text-xl font-bold text-gray-800 mb-4">Signatures</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Label htmlFor="inspector-signature">Inspector Signature</Label>
							<Input
								id="inspector-signature"
								value={inspectorSignature}
								onChange={(e) => setInspectorSignature(e.target.value)}
								placeholder="Type your name to sign"
								className="mt-2"
							/>
							<div className="text-sm text-gray-500 mt-1">
								Date: {new Date().toLocaleDateString()}
							</div>
						</div>
						<div>
							<Label htmlFor="cleaner-name">Team Member Name</Label>
							<Input
								id="cleaner-name"
								value={cleanerName}
								onChange={(e) => setCleanerName(e.target.value)}
								placeholder="Enter team member name"
								className="mt-2"
							/>
							<Label htmlFor="cleaner-signature" className="mt-3 block">
								Team Member Signature
							</Label>
							<Input
								id="cleaner-signature"
								value={cleanerSignature}
								onChange={(e) => setCleanerSignature(e.target.value)}
								placeholder="Type name to sign"
								className="mt-2"
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="bg-gray-800 text-white p-6 text-center rounded-lg">
					<p className="font-semibold">
						Element Cleaning Systems - Quick Inspection Summary
					</p>
					<p className="text-sm opacity-75 mt-1">
						Generated on {new Date().toLocaleDateString()} | Report ID: QIR-
						{Date.now().toString().slice(-8)}
					</p>
				</div>
			</div>
		</div>
	);
}
