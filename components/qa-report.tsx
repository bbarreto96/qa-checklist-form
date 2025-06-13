"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Download,
	Printer,
	CheckCircle,
	AlertTriangle,
	AlertCircle,
	Star,
	Calendar,
	Clock,
	User,
	Upload,
	Check,
	X,
	Menu,
	ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuickInspectionReport from "./quick-inspection-report";
import { toast } from "sonner";
import { SheetsSubmissionData, SheetsSubmissionResponse } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface QAReportProps {
	data: ReportData;
	formId: string;
	onBack: () => void;
}

export default function QAReport({ data, formId, onBack }: QAReportProps) {
	const [inspectorSignature, setInspectorSignature] = useState("");
	const [cleanerSignature, setCleanerSignature] = useState("");
	const [cleanerName, setCleanerName] = useState("");
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [showQuickReport, setShowQuickReport] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Mobile detection and refs
	const isMobile = useIsMobile();
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	// Close mobile menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(event.target as Node)
			) {
				setIsMobileMenuOpen(false);
			}
		};

		if (isMobileMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [isMobileMenuOpen]);

	// Status calculation functions
	const getStatusIcon = (status: QAStatus) => {
		switch (status) {
			case "green":
				return <CheckCircle className="w-5 h-5 text-green-600" />;
			case "yellow":
				return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
			case "red":
				return <AlertCircle className="w-5 h-5 text-red-600" />;
			default:
				return (
					<div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
				);
		}
	};

	const getStatusBadge = (status: QAStatus) => {
		switch (status) {
			case "green":
				return (
					<Badge className="bg-green-100 text-green-800 border-green-300">
						🟢 Good
					</Badge>
				);
			case "yellow":
				return (
					<Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
						🟡 Needs Attention
					</Badge>
				);
			case "red":
				return (
					<Badge className="bg-red-100 text-red-800 border-red-300">
						🔴 Urgent
					</Badge>
				);
			default:
				return <Badge variant="outline">Not Set</Badge>;
		}
	};

	const calculateAreaStatus = (area: InspectionArea): QAStatus => {
		const statuses = area.items
			.map((item) => item.status)
			.filter((status) => status !== "unset");
		if (statuses.length === 0) return "unset";

		if (statuses.some((status) => status === "red")) return "red";
		if (statuses.some((status) => status === "yellow")) return "yellow";
		return "green";
	};

	const calculateOverallStatus = (): QAStatus => {
		const areaStatuses = data.areas
			.map((area) => calculateAreaStatus(area))
			.filter((status) => status !== "unset");
		if (areaStatuses.length === 0) return "unset";

		if (areaStatuses.some((status) => status === "red")) return "red";
		if (areaStatuses.some((status) => status === "yellow")) return "yellow";
		return "green";
	};

	const getFollowUpTime = (status: QAStatus): string => {
		switch (status) {
			case "red":
				return "24 hours";
			case "yellow":
				return "3 days";
			case "green":
				return "N/A";
			default:
				return "TBD";
		}
	};

	const getStatusCounts = () => {
		let green = 0,
			yellow = 0,
			red = 0;
		data.areas.forEach((area) => {
			area.items.forEach((item) => {
				if (item.status === "green") green++;
				else if (item.status === "yellow") yellow++;
				else if (item.status === "red") red++;
			});
		});
		return { green, yellow, red };
	};

	const categorizeItems = () => {
		const excellent: { area: string; item: string; comments: string }[] = [];
		const roomToGrow: {
			area: string;
			item: string;
			comments: string;
			photos: string[];
		}[] = [];
		const highPriority: {
			area: string;
			item: string;
			comments: string;
			photos: string[];
		}[] = [];

		data.areas.forEach((area) => {
			area.items.forEach((item) => {
				if (item.status === "green") {
					excellent.push({
						area: area.name,
						item: item.name,
						comments: item.comments,
					});
				} else if (item.status === "yellow") {
					roomToGrow.push({
						area: area.name,
						item: item.name,
						comments: item.comments,
						photos: item.photos,
					});
				} else if (item.status === "red") {
					highPriority.push({
						area: area.name,
						item: item.name,
						comments: item.comments,
						photos: item.photos,
					});
				}
			});
		});

		return { excellent, roomToGrow, highPriority };
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

	const handleSubmitToSheets = async () => {
		// Validate signatures before submission
		if (!inspectorSignature.trim()) {
			toast.error("Inspector signature is required before submission");
			return;
		}

		if (!cleanerSignature.trim() || !cleanerName.trim()) {
			toast.error(
				"Team member name and signature are required before submission"
			);
			return;
		}

		setIsSubmitting(true);

		try {
			const overallStatus = calculateOverallStatus();
			const statusCounts = getStatusCounts();
			const { excellent, roomToGrow, highPriority } = categorizeItems();

			// Prepare area breakdown data
			const areaBreakdown = data.areas.map((area) => ({
				areaName: area.name,
				weight: area.weight,
				itemCount: area.items.length,
				greenCount: area.items.filter((item) => item.status === "green").length,
				yellowCount: area.items.filter((item) => item.status === "yellow")
					.length,
				redCount: area.items.filter((item) => item.status === "red").length,
				status: calculateAreaStatus(area),
			}));

			const submissionData: SheetsSubmissionData = {
				formId,
				submissionTimestamp: new Date().toISOString(),
				inspectorInfo: data.inspectorInfo,
				overallStatus,
				statusCounts,
				totalItems: statusCounts.green + statusCounts.yellow + statusCounts.red,
				totalAreas: data.areas.length,
				wins: data.wins,
				cleanerFeedback: data.cleanerFeedback,
				signatures: {
					inspectorSignature,
					cleanerSignature,
					cleanerName,
				},
				categorizedItems: {
					excellent,
					roomToGrow,
					highPriority,
				},
				areaBreakdown,
			};

			const response = await fetch("/api/submit-to-sheets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submissionData),
			});

			const result: SheetsSubmissionResponse = await response.json();

			if (result.success) {
				setIsSubmitted(true);
				toast.success(result.message);
			} else {
				toast.error(result.message || "Failed to submit report");
				console.error("Submission error:", result.error);
			}
		} catch (error) {
			console.error("Error submitting to Google Sheets:", error);
			toast.error("Network error. Please check your connection and try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const generateReportHTML = () => {
		const reportId = formId;
		const currentDate = new Date().toLocaleDateString();
		const overallStatus = calculateOverallStatus();
		const statusCounts = getStatusCounts();
		const { excellent, roomToGrow, highPriority } = categorizeItems();

		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Assurance Report - ${data.inspectorInfo.facilityName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Page Setup for Letter Size Portrait - Maximum Utilization */
        @page {
            size: letter portrait;
            margin: 0.2in;
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
        }

        /* Page Break Controls - Disabled for single page */
        .page-break {
            display: none;
        }

        .no-page-break {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .section-break {
            page-break-after: avoid;
            break-after: avoid;
        }

        /* Single Page Container - Dynamic Content-Based Height */
        .single-page-container {
            min-height: 10.6in;
            overflow: visible;
            padding: 0.1in;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .summary-header {
            background: linear-gradient(135deg, #4BAA47 0%, #3d8b40 100%);
            color: white;
            padding: 8px;
            text-align: center;
            margin-bottom: 4px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(75, 170, 71, 0.2);
            flex: 0 0 auto;
        }

        .summary-header h1 {
            font-size: 16px;
            margin-bottom: 2px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        .summary-header p {
            font-size: 11px;
            opacity: 0.95;
            font-weight: 500;
        }

        .summary-status {
            margin: 3px 0;
            text-align: center;
        }

        .summary-main {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px;
            margin-bottom: 4px;
            flex: 0 0 auto;
        }

        .summary-card {
            background: #ffffff;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .summary-card h3 {
            color: #4BAA47;
            font-size: 9px;
            margin-bottom: 4px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 2px;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 8px;
            line-height: 1.2;
        }

        .summary-item .label {
            color: #6b7280;
            font-weight: 500;
        }

        .summary-item .value {
            color: #374151;
            font-weight: 600;
        }

        .status-overview {
            grid-column: 1 / -1;
            margin: 3px 0;
        }

        .status-counts {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3px;
            margin-bottom: 3px;
        }

        .status-count-card {
            text-align: center;
            padding: 4px;
            border-radius: 4px;
            border: 1px solid;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .status-count-card.green {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            border-color: #22c55e;
            color: #166534;
        }

        .status-count-card.yellow {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-color: #eab308;
            color: #92400e;
        }

        .status-count-card.red {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-color: #ef4444;
            color: #991b1b;
        }

        .status-count-card .count {
            font-size: 14px;
            font-weight: 800;
            margin-bottom: 1px;
            line-height: 1;
        }

        .status-count-card .label {
            font-size: 7px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1px;
        }

        .key-wins-summary {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 3px;
            padding: 3px;
            border-left: 2px solid #0ea5e9;
            box-shadow: 0 1px 2px rgba(14, 165, 233, 0.04);
        }

        .key-wins-summary h3 {
            color: #0369a1;
            margin-bottom: 1px;
            font-size: 7px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 1px;
        }

        .wins-preview {
            font-size: 6px;
            line-height: 1.1;
            color: #0c4a6e;
        }

        .wins-preview .win-item {
            margin-bottom: 1px;
            padding: 1px 3px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 2px;
            border-left: 1px solid #0ea5e9;
        }

        .wins-preview .more-indicator {
            font-style: italic;
            color: #0369a1;
            text-align: center;
            margin-top: 1px;
            font-weight: 500;
        }

        .summary-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 2px;
            border-top: 1px solid #e5e7eb;
            font-size: 5px;
            color: #6b7280;
        }

        .summary-footer .report-id {
            font-weight: 600;
            color: #374151;
        }

        /* Content Area - Natural content flow */
        .content-area {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        /* Detailed Sections Styles - Natural content-based sizing */
        .detailed-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 6px;
            padding: 8px;
            background: #ffffff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .section-header {
            color: #4BAA47;
            font-size: 12px;
            margin-bottom: 6px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 3px;
            padding-bottom: 3px;
            border-bottom: 2px solid #4BAA47;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: 500;
            margin-right: 6px;
        }

        .status-green { background: #dcfce7; color: #166534; }
        .status-yellow { background: #fef3c7; color: #92400e; }
        .status-red { background: #fee2e2; color: #991b1b; }

        .item-card {
            background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
            border-radius: 4px;
            padding: 6px;
            margin-bottom: 4px;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #4BAA47;
            page-break-inside: avoid;
            break-inside: avoid;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.04);
        }

        .item-header {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }

        .item-title {
            font-weight: 600;
            font-size: 9px;
            color: #374151;
        }

        .item-content {
            font-size: 9px;
            line-height: 1.3;
            color: #6b7280;
            background: rgba(255, 255, 255, 0.8);
            padding: 4px;
            border-radius: 3px;
            margin-top: 4px;
        }

        .follow-up-time {
            font-size: 8px;
            font-weight: 500;
            margin-top: 4px;
            padding: 2px 4px;
            background: #f3f4f6;
            border-radius: 3px;
            display: inline-block;
        }

        .feedback-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 4px;
            padding: 6px;
            border-left: 3px solid #0ea5e9;
            page-break-inside: avoid;
            break-inside: avoid;
            box-shadow: 0 2px 4px rgba(14, 165, 233, 0.08);
        }

        .feedback-content {
            background: rgba(255, 255, 255, 0.9);
            padding: 4px;
            border-radius: 3px;
            font-size: 9px;
            line-height: 1.3;
            color: #0c4a6e;
        }

        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 6px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .signature-box {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 8px;
            text-align: left;
            min-height: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .signature-box h4 {
            margin-bottom: 4px;
            color: #4BAA47;
            font-size: 9px;
            font-weight: 700;
        }

        .signature-line {
            border-bottom: 1px solid #374151;
            margin: 4px 0;
            height: 16px;
            display: flex;
            align-items: end;
            padding-bottom: 2px;
            font-size: 8px;
            font-weight: 600;
            color: #374151;
        }

        .signature-date {
            font-size: 7px;
            color: #6b7280;
            font-weight: 500;
            margin-top: 2px;
        }

        .footer {
            background: #474D53;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 8px;
            margin-top: 6px;
            border-radius: 4px;
            flex: 0 0 auto;
        }

        @media print {
            .no-print { display: none !important; }
            body { background: white; }
            .page-break { page-break-before: always; }
            .no-page-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <!-- SINGLE PAGE LAYOUT -->
    <div class="single-page-container">
        <div class="summary-header">
            <h1>Quality Assurance Report</h1>
            <p>Element Cleaning Systems</p>
            <div class="summary-status">
                <span class="status-badge status-${overallStatus}">
                    ${
											overallStatus === "green"
												? "🟢 Good"
												: overallStatus === "yellow"
												? "🟡 Needs Attention"
												: "🔴 Urgent"
										}
                </span>
            </div>
        </div>

        <div class="summary-main">
            <div class="summary-card">
                <h3>📋 Inspection Details</h3>
                <div class="summary-item">
                    <span class="label">Report ID:</span>
                    <span class="value">${reportId}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Inspector:</span>
                    <span class="value">${
											data.inspectorInfo.inspectorName
										}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Facility:</span>
                    <span class="value">${
											data.inspectorInfo.facilityName
										}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Date:</span>
                    <span class="value">${data.inspectorInfo.date}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Shift:</span>
                    <span class="value">${data.inspectorInfo.shift}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Team:</span>
                    <span class="value">${
											data.inspectorInfo.cleaningTeam
										}</span>
                </div>
            </div>

            <div class="summary-card">
                <h3>📊 QA Overview</h3>
                <div class="summary-item">
                    <span class="label">Overall Status:</span>
                    <span class="value">${
											overallStatus === "green"
												? "🟢 Good"
												: overallStatus === "yellow"
												? "🟡 Needs Attention"
												: "🔴 Urgent"
										}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Follow-up Required:</span>
                    <span class="value">${getFollowUpTime(overallStatus)}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Total Items Inspected:</span>
                    <span class="value">${
											statusCounts.green +
											statusCounts.yellow +
											statusCounts.red
										}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Areas Covered:</span>
                    <span class="value">${data.areas.length}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Generated:</span>
                    <span class="value">${currentDate}</span>
                </div>
            </div>

            <div class="status-overview">
                <div class="status-counts">
                    <div class="status-count-card green">
                        <div class="count">${statusCounts.green}</div>
                        <div class="label">Good</div>
                    </div>
                    <div class="status-count-card yellow">
                        <div class="count">${statusCounts.yellow}</div>
                        <div class="label">Needs Attention</div>
                    </div>
                    <div class="status-count-card red">
                        <div class="count">${statusCounts.red}</div>
                        <div class="label">Urgent</div>
                    </div>
                </div>

                ${
									data.wins.filter((win) => win.description.trim()).length > 0
										? `
                <div class="key-wins-summary">
                    <h3>⭐ Key Wins This Shift</h3>
                    <div class="wins-preview">
                        ${data.wins
													.filter((win) => win.description.trim())
													.slice(0, 1)
													.map(
														(win) => `
                            <div class="win-item">${
															win.description.length > 40
																? win.description.substring(0, 40) + "..."
																: win.description
														}</div>
                        `
													)
													.join("")}
                        ${
													data.wins.filter((win) => win.description.trim())
														.length > 1
														? `<div class="more-indicator">+ ${
																data.wins.filter((win) =>
																	win.description.trim()
																).length - 1
														  } more wins</div>`
														: ""
												}
                    </div>
                </div>
                `
										: ""
								}
            </div>
        </div>

        <!-- Content Area - Flexible to fill remaining space -->
        <div class="content-area">
    ${
			data.wins.filter((win) => win.description.trim()).length > 0
				? `
    <div class="detailed-section">
        <h2 class="section-header">⭐ All Wins This Shift (${
					data.wins.filter((win) => win.description.trim()).length
				})</h2>
        ${data.wins
					.filter((win) => win.description.trim())
					.map(
						(win) => `
            <div class="item-card">
                <div class="item-content">${win.description}</div>
            </div>
        `
					)
					.join("")}
    </div>
    `
				: ""
		}

    ${
			excellent.length > 0
				? `
    <div class="detailed-section">
        <h2 class="section-header">✅ Excellent Performance (${
					excellent.length
				})</h2>
        ${excellent
					.map(
						(item) => `
            <div class="item-card">
                <div class="item-header">
                    <span class="status-badge status-green">🟢</span>
                    <span class="item-title">${item.area}: ${item.item}</span>
                </div>
                ${
									item.comments
										? `<div class="item-content">${item.comments}</div>`
										: ""
								}
            </div>
        `
					)
					.join("")}
    </div>
    `
				: ""
		}

    ${
			roomToGrow.length > 0
				? `
    <div class="detailed-section">
        <h2 class="section-header">📈 Room to Grow (${roomToGrow.length})</h2>
        ${roomToGrow
					.map(
						(item) => `
            <div class="item-card">
                <div class="item-header">
                    <span class="status-badge status-yellow">🟡</span>
                    <span class="item-title">${item.area}: ${item.item}</span>
                </div>
                ${
									item.comments
										? `<div class="item-content">${item.comments}</div>`
										: ""
								}
                <div class="follow-up-time">Follow-up: 3 days</div>
            </div>
        `
					)
					.join("")}
    </div>
    `
				: ""
		}

    ${
			highPriority.length > 0
				? `
    <div class="detailed-section">
        <h2 class="section-header">🚨 High Priority Follow-Up</h2>
        ${highPriority
					.map(
						(item) => `
            <div class="item-card">
                <div class="item-header">
                    <span class="status-badge status-red">🔴</span>
                    <span class="item-title">${item.area}: ${item.item}</span>
                </div>
                ${
									item.comments
										? `<div class="item-content">${item.comments}</div>`
										: ""
								}
                <div class="follow-up-time">Follow-up: 24 hours</div>
            </div>
        `
					)
					.join("")}
    </div>
    `
				: ""
		}

    ${
			data.cleanerFeedback
				? `
    <div class="detailed-section">
        <h2 class="section-header">💬 Team Feedback</h2>
        <div class="feedback-section">
            <div class="feedback-content">${data.cleanerFeedback}</div>
        </div>
    </div>
    `
				: ""
		}

    <!-- Additional Comprehensive Sections to Fill Page -->
    ${
			data.areas.length > 0
				? `
    <div class="detailed-section">
        <h2 class="section-header">📋 Area Coverage Summary</h2>
        ${data.areas
					.map(
						(area) => `
            <div class="item-card">
                <div class="item-header">
                    <span class="item-title">${area.name}</span>
                </div>
                <div class="item-content">
                    Items Inspected: ${area.items.length} |
                    Weight: ${area.weight}% |
                    Status Distribution:
                    ${
											area.items.filter((item) => item.status === "green")
												.length
										} Good,
                    ${
											area.items.filter((item) => item.status === "yellow")
												.length
										} Attention,
                    ${
											area.items.filter((item) => item.status === "red").length
										} Urgent
                </div>
            </div>
        `
					)
					.join("")}
    </div>
    `
				: ""
		}

    <div class="detailed-section">
        <h2 class="section-header">📊 Quality Metrics & Trends</h2>
        <div class="item-card">
            <div class="item-content">
                <strong>Overall Performance:</strong> ${
									statusCounts.green + statusCounts.yellow + statusCounts.red >
									0
										? Math.round(
												(statusCounts.green /
													(statusCounts.green +
														statusCounts.yellow +
														statusCounts.red)) *
													100
										  )
										: 0
								}% items meeting standards<br>
                <strong>Improvement Areas:</strong> ${
									statusCounts.yellow + statusCounts.red
								} items requiring follow-up<br>
                <strong>Critical Issues:</strong> ${
									statusCounts.red
								} high-priority items identified<br>
                <strong>Team Strengths:</strong> ${
									data.wins.filter((win) => win.description.trim()).length
								} positive observations recorded
            </div>
        </div>
        <div class="item-card">
            <div class="item-content">
                <strong>Quality Standards:</strong> Element Cleaning Systems maintains the highest standards of cleanliness and organization across all facilities.<br>
                <strong>Continuous Improvement:</strong> Regular inspections ensure consistent quality and identify opportunities for enhancement.<br>
                <strong>Team Excellence:</strong> Our dedicated cleaning teams work diligently to exceed expectations and maintain professional standards.<br>
                <strong>Client Satisfaction:</strong> Quality assurance processes ensure optimal facility conditions for all occupants and visitors.
            </div>
        </div>
    </div>

    <div class="detailed-section">
        <h2 class="section-header">✍️ Signatures</h2>
        <div class="signature-section">
            <div class="signature-box">
                <h4>Inspector Signature</h4>
                <div class="signature-line">${inspectorSignature}</div>
                <div class="signature-date">Date: ${currentDate}</div>
            </div>
            <div class="signature-box">
                <h4>Team Member Signature</h4>
                <div class="signature-line">${cleanerSignature}</div>
                <div class="signature-date">Name: ${cleanerName}</div>
            </div>
        </div>
    </div>
        </div>

        <div class="footer">
            <p>Element Cleaning Systems - Quality Assurance Report</p>
            <p>Generated on ${currentDate} | Report ID: ${reportId}</p>
        </div>
    </div>
</body>
</html>
    `;
	};

	// Show quick report if requested
	if (showQuickReport) {
		return (
			<QuickInspectionReport
				data={data}
				onBack={() => setShowQuickReport(false)}
			/>
		);
	}

	const overallStatus = calculateOverallStatus();
	const statusCounts = getStatusCounts();
	const { excellent, roomToGrow, highPriority } = categorizeItems();
	const totalPhotos = data.areas.reduce(
		(sum, area) =>
			sum +
			area.items.reduce((itemSum, item) => itemSum + item.photos.length, 0),
		0
	);

	return (
		<div className="max-w-4xl mx-auto bg-white min-h-screen">
			{/* Action Buttons - Desktop and Mobile */}
			<div className="no-print sticky top-0 bg-white border-b z-20 p-4 shadow-sm">
				<div className="flex justify-between items-center">
					<Button
						onClick={onBack}
						variant="outline"
						size={isMobile ? "default" : "default"}
						className={cn(
							"flex items-center gap-2",
							isMobile ? "h-10 px-4 text-sm" : ""
						)}
					>
						← Back to Checklist
					</Button>

					{/* Desktop Action Buttons */}
					{!isMobile && (
						<div className="flex gap-2">
							<Button
								onClick={() => setShowQuickReport(true)}
								variant="outline"
								size="sm"
								className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
							>
								⚡ Quick Summary
							</Button>
							<Button onClick={handlePrint} variant="outline" size="sm">
								<Printer className="w-4 h-4 mr-2" />
								Print Preview
							</Button>
							<Button
								onClick={generatePDF}
								variant="outline"
								size="sm"
								disabled={isGeneratingPDF}
							>
								<Download className="w-4 h-4 mr-2" />
								{isGeneratingPDF ? "Generating..." : "Export PDF"}
							</Button>
							<Button
								onClick={handleSubmitToSheets}
								variant="default"
								size="sm"
								disabled={isSubmitting || isSubmitted}
								className={cn(
									"transition-all duration-200",
									isSubmitted
										? "bg-green-600 hover:bg-green-700 text-white"
										: "bg-blue-600 hover:bg-blue-700 text-white"
								)}
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Submitting...
									</>
								) : isSubmitted ? (
									<>
										<Check className="w-4 h-4 mr-2" />
										Submitted
									</>
								) : (
									<>
										<Upload className="w-4 h-4 mr-2" />
										Submit to Sheets
									</>
								)}
							</Button>
						</div>
					)}

					{/* Mobile Hamburger Menu */}
					{isMobile && (
						<div className="relative" ref={mobileMenuRef}>
							<Button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								variant="outline"
								size="default"
								className="h-10 w-10 p-0 border-gray-300"
							>
								{isMobileMenuOpen ? (
									<X className="w-5 h-5" />
								) : (
									<Menu className="w-5 h-5" />
								)}
							</Button>

							{/* Mobile Dropdown Menu */}
							{isMobileMenuOpen && (
								<div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30 animate-in slide-in-from-top-2 duration-200">
									<div className="p-2 space-y-1">
										<Button
											onClick={() => {
												setShowQuickReport(true);
												setIsMobileMenuOpen(false);
											}}
											variant="ghost"
											size="default"
											className="w-full justify-start h-12 px-4 text-left bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
										>
											⚡ Quick Summary
										</Button>
										<Button
											onClick={() => {
												handlePrint();
												setIsMobileMenuOpen(false);
											}}
											variant="ghost"
											size="default"
											className="w-full justify-start h-12 px-4 text-left"
										>
											<Printer className="w-4 h-4 mr-3" />
											Print Preview
										</Button>
										<Button
											onClick={() => {
												generatePDF();
												setIsMobileMenuOpen(false);
											}}
											variant="ghost"
											size="default"
											disabled={isGeneratingPDF}
											className="w-full justify-start h-12 px-4 text-left"
										>
											<Download className="w-4 h-4 mr-3" />
											{isGeneratingPDF ? "Generating..." : "Export PDF"}
										</Button>
										<Button
											onClick={() => {
												handleSubmitToSheets();
												setIsMobileMenuOpen(false);
											}}
											variant="ghost"
											size="default"
											disabled={isSubmitting || isSubmitted}
											className={cn(
												"w-full justify-start h-12 px-4 text-left transition-all duration-200",
												isSubmitted
													? "bg-green-50 text-green-700 hover:bg-green-100"
													: "bg-blue-50 text-blue-700 hover:bg-blue-100"
											)}
										>
											{isSubmitting ? (
												<>
													<div className="w-4 h-4 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Submitting...
												</>
											) : isSubmitted ? (
												<>
													<Check className="w-4 h-4 mr-3" />
													Submitted
												</>
											) : (
												<>
													<Upload className="w-4 h-4 mr-3" />
													Submit to Sheets
												</>
											)}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Report Header */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
				<h1 className="text-3xl font-bold mb-2">Quality Assurance Report</h1>
				<p className="text-lg opacity-90 mb-4">Element Cleaning Systems</p>
				<div className="flex justify-center">
					{getStatusBadge(overallStatus)}
				</div>
			</div>

			<div className="p-6 space-y-6">
				{/* Inspection Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-700">
							<User className="w-5 h-5" />
							Inspection Details
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Form ID</div>
								<div className="font-mono text-sm">{formId}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Inspector</div>
								<div>{data.inspectorInfo.inspectorName}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Facility</div>
								<div>{data.inspectorInfo.facilityName}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Date</div>
								<div>{data.inspectorInfo.date}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Shift</div>
								<div>{data.inspectorInfo.shift}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Team</div>
								<div>{data.inspectorInfo.cleaningTeam}</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="font-semibold text-gray-700">Photos</div>
								<div>{totalPhotos}</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Wins This Shift */}
				{data.wins.filter((win) => win.description.trim()).length > 0 && (
					<Card className="border-blue-200 bg-blue-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-blue-800">
								<Star className="w-5 h-5" />
								Wins This Shift
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{data.wins
								.filter((win) => win.description.trim())
								.map((win) => (
									<div
										key={win.id}
										className="bg-white p-4 rounded-lg border-l-4 border-blue-400"
									>
										{win.description}
									</div>
								))}
						</CardContent>
					</Card>
				)}

				{/* QA Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-700">
							<CheckCircle className="w-5 h-5" />
							QA Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="bg-green-50 p-4 rounded-lg border border-green-200">
								<div className="text-2xl font-bold text-green-600">
									{statusCounts.green}
								</div>
								<div className="text-sm text-green-700">🟢 Good</div>
							</div>
							<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
								<div className="text-2xl font-bold text-yellow-600">
									{statusCounts.yellow}
								</div>
								<div className="text-sm text-yellow-700">
									🟡 Needs Attention
								</div>
							</div>
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<div className="text-2xl font-bold text-red-600">
									{statusCounts.red}
								</div>
								<div className="text-sm text-red-700">🔴 Urgent</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<div className="text-lg font-bold text-gray-600">
									{getFollowUpTime(overallStatus)}
								</div>
								<div className="text-sm text-gray-700">Follow-up Required</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Excellent Performance */}
				{excellent.length > 0 && (
					<Card className="border-green-200 bg-green-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-green-800">
								<CheckCircle className="w-5 h-5" />
								Excellent Performance
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{excellent.map((item, index) => (
								<div
									key={index}
									className="bg-white p-4 rounded-lg border-l-4 border-green-400"
								>
									<div className="flex items-center gap-2 mb-2">
										<Badge className="bg-green-100 text-green-800">
											🟢 Good
										</Badge>
										<span className="font-semibold">{item.area}</span>
									</div>
									<div className="text-gray-700">{item.item}</div>
									{item.comments && (
										<div className="text-sm text-gray-600 mt-2 italic">
											{item.comments}
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Room to Grow */}
				{roomToGrow.length > 0 && (
					<Card className="border-yellow-200 bg-yellow-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-yellow-800">
								<AlertTriangle className="w-5 h-5" />
								Room to Grow
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{roomToGrow.map((item, index) => (
								<div
									key={index}
									className="bg-white p-4 rounded-lg border-l-4 border-yellow-400"
								>
									<div className="flex items-center gap-2 mb-2">
										<Badge className="bg-yellow-100 text-yellow-800">
											🟡 Needs Attention
										</Badge>
										<span className="font-semibold">{item.area}</span>
									</div>
									<div className="text-gray-700">{item.item}</div>
									{item.comments && (
										<div className="text-sm text-gray-600 mt-2 italic">
											{item.comments}
										</div>
									)}
									<div className="text-xs text-yellow-700 mt-2 font-medium">
										Follow-up: 3 days
									</div>
									{item.photos.length > 0 && (
										<div className="flex gap-2 mt-3 overflow-x-auto">
											{item.photos.map((photo, photoIndex) => (
												<img
													key={photoIndex}
													src={photo || "/placeholder.svg"}
													alt={`${item.item} photo ${photoIndex + 1}`}
													className="w-16 h-16 object-cover rounded border"
												/>
											))}
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* High Priority Follow-Up */}
				{highPriority.length > 0 && (
					<Card className="border-red-200 bg-red-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-800">
								<AlertCircle className="w-5 h-5" />
								High Priority Follow-Up
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{highPriority.map((item, index) => (
								<div
									key={index}
									className="bg-white p-4 rounded-lg border-l-4 border-red-400"
								>
									<div className="flex items-center gap-2 mb-2">
										<Badge className="bg-red-100 text-red-800">🔴 Urgent</Badge>
										<span className="font-semibold">{item.area}</span>
									</div>
									<div className="text-gray-700">{item.item}</div>
									{item.comments && (
										<div className="text-sm text-gray-600 mt-2 italic">
											{item.comments}
										</div>
									)}
									<div className="text-xs text-red-700 mt-2 font-medium">
										Follow-up: 24 hours
									</div>
									{item.photos.length > 0 && (
										<div className="flex gap-2 mt-3 overflow-x-auto">
											{item.photos.map((photo, photoIndex) => (
												<img
													key={photoIndex}
													src={photo || "/placeholder.svg"}
													alt={`${item.item} photo ${photoIndex + 1}`}
													className="w-16 h-16 object-cover rounded border"
												/>
											))}
										</div>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Team Feedback */}
				{data.cleanerFeedback && (
					<Card className="border-blue-200 bg-blue-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-blue-800">
								💬 Team Feedback
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
								{data.cleanerFeedback}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Signatures Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-700">
							✍️ Signatures
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="bg-gray-800 text-white p-6 text-center rounded-lg">
					<p className="font-semibold">
						Element Cleaning Systems - Quality Assurance Report
					</p>
					<p className="text-sm opacity-75 mt-1">
						Generated on {new Date().toLocaleDateString()} | Report ID: {formId}
					</p>
				</div>
			</div>
		</div>
	);
}
