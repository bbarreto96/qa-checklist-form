"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Camera,
	X,
	FileText,
	Download,
	Star,
	CheckCircle,
	AlertTriangle,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Copy,
	Check,
	Save,
	Smartphone,
	Wifi,
	WifiOff,
	RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QAReport from "./qa-report";
import OfflineIndicator from "./offline-indicator";
import MobileCamera from "./mobile-camera";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useIsMobile } from "@/hooks/use-mobile";

// QA Status type for tier-based grading
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

interface FormStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
}

const FORM_STEPS: FormStep[] = [
	{
		id: "info",
		title: "Inspection Information",
		description: "Basic inspection details",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: "wins",
		title: "Wins This Shift",
		description: "Record positive observations",
		icon: <Star className="w-5 h-5" />,
	},
	{
		id: "feedback",
		title: "Team Feedback",
		description: "Additional comments and feedback",
		icon: <CheckCircle className="w-5 h-5" />,
	},
	{
		id: "restrooms",
		title: "Restrooms",
		description: "Inspect restroom areas",
		icon: <CheckCircle className="w-5 h-5" />,
	},
	{
		id: "offices",
		title: "Offices",
		description: "Inspect office areas",
		icon: <CheckCircle className="w-5 h-5" />,
	},
	{
		id: "common",
		title: "Common Areas",
		description: "Inspect common areas",
		icon: <CheckCircle className="w-5 h-5" />,
	},
	{
		id: "exterior",
		title: "Exterior",
		description: "Inspect exterior areas",
		icon: <CheckCircle className="w-5 h-5" />,
	},
];

// Initial state factory functions
const getInitialInspectorInfo = () => ({
	inspectorName: "",
	facilityName: "",
	date: new Date().toISOString().split("T")[0],
	shift: "",
	cleaningTeam: "",
});

const getInitialWins = (): WinsEntry[] => [{ id: "1", description: "" }];

const getInitialAreas = (): InspectionArea[] => [
	{
		id: "restrooms",
		name: "Restrooms",
		weight: 0.25,
		items: [
			{
				id: "toilets",
				name: "Toilets & Urinals",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "sinks",
				name: "Sinks & Mirrors",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "floors",
				name: "Floor & Drains",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "supplies",
				name: "Supplies & Dispensers",
				status: "unset",
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
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "floors-offices",
				name: "Floors & Carpets",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "trash",
				name: "Trash & Recycling",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "windows",
				name: "Windows & Glass",
				status: "unset",
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
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "kitchen",
				name: "Kitchen & Break Room",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "hallways",
				name: "Hallways & Stairs",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "elevators",
				name: "Elevators",
				status: "unset",
				comments: "",
				photos: [],
			},
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
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "parking",
				name: "Parking Areas",
				status: "unset",
				comments: "",
				photos: [],
			},
			{
				id: "landscaping",
				name: "Landscaping Areas",
				status: "unset",
				comments: "",
				photos: [],
			},
		],
	},
];

export default function QAChecklist() {
	const [currentStep, setCurrentStep] = useState(0);
	const [showReport, setShowReport] = useState(false);
	const [showMobileCamera, setShowMobileCamera] = useState(false);
	const [currentPhotoContext, setCurrentPhotoContext] = useState<{
		areaId: string;
		itemId: string;
	} | null>(null);

	// Mobile and offline hooks
	const isMobile = useIsMobile();
	const {
		isOnline,
		isInitialized,
		saveFormData,
		loadFormData,
		error: offlineError,
	} = useOfflineStorage();

	// Generate unique form ID (client-side only to avoid hydration mismatch)
	const generateFormId = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const timestamp = now.getTime().toString().slice(-4);
		return `QA-${year}-${month}-${day}-${timestamp}`;
	};

	const [formId, setFormId] = useState<string>("");
	const [isFormIdCopied, setIsFormIdCopied] = useState(false);
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [showResetDialog, setShowResetDialog] = useState(false);

	// Generate form ID on client side only to avoid hydration mismatch
	useEffect(() => {
		const newFormId = generateFormId();
		setFormId(newFormId);

		// Try to load existing form data
		if (isInitialized) {
			loadFormData(newFormId).then((data) => {
				if (data) {
					// Restore form state from saved data
					setInspectorInfo(data.inspectorInfo);
					setAreas(data.areas);
					setWins(data.wins);
					setCleanerFeedback(data.cleanerFeedback);
				}
			});
		}
	}, [isInitialized]);

	const [inspectorInfo, setInspectorInfo] = useState(getInitialInspectorInfo);

	const [wins, setWins] = useState<WinsEntry[]>(getInitialWins);

	const [cleanerFeedback, setCleanerFeedback] = useState("");

	const [areas, setAreas] = useState<InspectionArea[]>(getInitialAreas);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Auto-save functionality
	const autoSaveForm = async () => {
		if (!autoSaveEnabled || !formId || !isInitialized) return;

		// Check if there's any meaningful data to save
		const hasData =
			inspectorInfo.inspectorName.trim() ||
			inspectorInfo.facilityName.trim() ||
			areas.some((area) =>
				area.items.some(
					(item) => item.status !== "unset" || item.comments.trim()
				)
			) ||
			wins.some((win) => win.description.trim()) ||
			cleanerFeedback.trim();

		if (!hasData) return; // Don't save empty forms

		try {
			const formData = {
				inspectorInfo,
				areas,
				wins,
				cleanerFeedback,
			};

			await saveFormData(formId, formData, "draft");
			setLastSaved(new Date());
		} catch (err) {
			console.error("Auto-save failed:", err);
			// Don't show error to user for auto-save failures
		}
	};

	// Auto-save when form data changes
	useEffect(() => {
		if (!autoSaveEnabled || !formId || !isInitialized) return;

		const timeoutId = setTimeout(autoSaveForm, 2000); // Save after 2 seconds of inactivity
		return () => clearTimeout(timeoutId);
	}, [
		inspectorInfo,
		areas,
		wins,
		cleanerFeedback,
		autoSaveEnabled,
		formId,
		isInitialized,
		autoSaveForm,
	]);

	// Form ID copy functionality
	const copyFormId = async () => {
		if (!formId) return;
		try {
			await navigator.clipboard.writeText(formId);
			setIsFormIdCopied(true);
			setTimeout(() => setIsFormIdCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy form ID:", err);
		}
	};

	// Reset form functionality
	const handleResetForm = async () => {
		try {
			// Clear any saved data for current form
			if (formId && isInitialized) {
				// Note: We could add a clearFormData function to the offline storage hook if needed
				// For now, we'll just reset the state and generate a new form ID
			}

			// Reset all form state
			setCurrentStep(0);
			setShowReport(false);
			setShowMobileCamera(false);
			setCurrentPhotoContext(null);
			setInspectorInfo(getInitialInspectorInfo());
			setWins(getInitialWins());
			setCleanerFeedback("");
			setAreas(getInitialAreas());
			setLastSaved(null);
			setIsFormIdCopied(false);

			// Generate new form ID
			const newFormId = generateFormId();
			setFormId(newFormId);

			// Close reset dialog
			setShowResetDialog(false);

			console.log("Form reset successfully");
		} catch (err) {
			console.error("Failed to reset form:", err);
		}
	};

	// Status management functions
	const updateItemStatus = (
		areaId: string,
		itemId: string,
		status: QAStatus
	) => {
		setAreas((prev) =>
			prev.map((area) =>
				area.id === areaId
					? {
							...area,
							items: area.items.map((item) =>
								item.id === itemId ? { ...item, status } : item
							),
					  }
					: area
			)
		);
	};

	const updateItemComments = (
		areaId: string,
		itemId: string,
		comments: string
	) => {
		setAreas((prev) =>
			prev.map((area) =>
				area.id === areaId
					? {
							...area,
							items: area.items.map((item) =>
								item.id === itemId ? { ...item, comments } : item
							),
					  }
					: area
			)
		);
	};

	// Photo management
	const handlePhotoUpload = (
		areaId: string,
		itemId: string,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (files) {
			Array.from(files).forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const photoUrl = e.target?.result as string;
					addPhotoToItem(areaId, itemId, photoUrl);
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const addPhotoToItem = (areaId: string, itemId: string, photoUrl: string) => {
		setAreas((prev) =>
			prev.map((area) =>
				area.id === areaId
					? {
							...area,
							items: area.items.map((item) =>
								item.id === itemId
									? { ...item, photos: [...item.photos, photoUrl] }
									: item
							),
					  }
					: area
			)
		);
	};

	const handleMobileCameraOpen = (areaId: string, itemId: string) => {
		setCurrentPhotoContext({ areaId, itemId });
		setShowMobileCamera(true);
	};

	const handleMobileCameraCapture = (photoDataUrl: string) => {
		if (currentPhotoContext) {
			addPhotoToItem(
				currentPhotoContext.areaId,
				currentPhotoContext.itemId,
				photoDataUrl
			);
		}
		setShowMobileCamera(false);
		setCurrentPhotoContext(null);
	};

	const handleMobileCameraClose = () => {
		setShowMobileCamera(false);
		setCurrentPhotoContext(null);
	};

	const removePhoto = (areaId: string, itemId: string, photoIndex: number) => {
		setAreas((prev) =>
			prev.map((area) =>
				area.id === areaId
					? {
							...area,
							items: area.items.map((item) =>
								item.id === itemId
									? {
											...item,
											photos: item.photos.filter(
												(_, index) => index !== photoIndex
											),
									  }
									: item
							),
					  }
					: area
			)
		);
	};

	// Wins management
	const addWin = () => {
		setWins((prev) => [
			...prev,
			{ id: Date.now().toString(), description: "" },
		]);
	};

	const updateWin = (id: string, description: string) => {
		setWins((prev) =>
			prev.map((win) => (win.id === id ? { ...win, description } : win))
		);
	};

	const removeWin = (id: string) => {
		if (wins.length > 1) {
			setWins((prev) => prev.filter((win) => win.id !== id));
		}
	};

	// Status calculation and display functions
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
		const areaStatuses = areas
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

	// Navigation and validation functions
	const validateCurrentStep = (): boolean => {
		const currentStepData = FORM_STEPS[currentStep];

		switch (currentStepData.id) {
			case "info":
				return !!(
					inspectorInfo.inspectorName.trim() &&
					inspectorInfo.facilityName.trim() &&
					inspectorInfo.date &&
					inspectorInfo.shift &&
					inspectorInfo.cleaningTeam.trim()
				);
			case "wins":
				// Wins are optional, so always valid
				return true;
			case "feedback":
				// Feedback is optional, so always valid
				return true;
			default:
				// For area inspections, check if at least one item has been assessed
				const area = areas.find((a) => a.id === currentStepData.id);
				return area
					? area.items.some((item) => item.status !== "unset")
					: false;
		}
	};

	const canProceedToNext = (): boolean => {
		return validateCurrentStep();
	};

	const handleNext = () => {
		if (currentStep < FORM_STEPS.length - 1 && canProceedToNext()) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		if (validateCurrentStep()) {
			// Save completed form
			try {
				const formData = {
					inspectorInfo,
					areas,
					wins,
					cleanerFeedback,
				};

				await saveFormData(formId, formData, "completed");
				setShowReport(true);
			} catch (err) {
				console.error("Failed to save completed form:", err);
				// Still show report even if save fails
				setShowReport(true);
			}
		}
	};

	const getCurrentStepData = () => FORM_STEPS[currentStep];

	// Status selection component
	const StatusSelector = ({
		value,
		onChange,
		label,
	}: {
		value: QAStatus;
		onChange: (status: QAStatus) => void;
		label: string;
	}) => (
		<div className="space-y-2">
			<Label className="text-sm font-medium">{label}</Label>
			<div className="flex gap-2">
				{[
					{
						status: "green" as QAStatus,
						label: "🟢 Good",
						color: "bg-green-100 hover:bg-green-200 border-green-300",
					},
					{
						status: "yellow" as QAStatus,
						label: "🟡 Needs Attention",
						color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
					},
					{
						status: "red" as QAStatus,
						label: "🔴 Urgent",
						color: "bg-red-100 hover:bg-red-200 border-red-300",
					},
				].map(({ status, label, color }) => (
					<button
						key={status}
						type="button"
						onClick={() => onChange(status)}
						className={cn(
							"flex-1 p-2 text-xs font-medium border-2 rounded-md transition-colors",
							value === status
								? color
								: "bg-gray-50 hover:bg-gray-100 border-gray-300"
						)}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	);

	// Progress indicator component
	const ProgressIndicator = () => (
		<div className="bg-white border-b p-4">
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium text-gray-600">
					Step {currentStep + 1} of {FORM_STEPS.length}
				</span>
				<span className="text-sm text-gray-500">
					{Math.round(((currentStep + 1) / FORM_STEPS.length) * 100)}%
				</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2 mb-3">
				<div
					className="bg-green-600 h-2 rounded-full transition-all duration-300"
					style={{
						width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%`,
					}}
				/>
			</div>
			<div className="flex items-center gap-2">
				{getCurrentStepData().icon}
				<div>
					<h2 className="font-semibold text-gray-900">
						{getCurrentStepData().title}
					</h2>
					<p className="text-sm text-gray-600">
						{getCurrentStepData().description}
					</p>
				</div>
			</div>
		</div>
	);

	if (showReport) {
		return (
			<QAReport
				data={{
					inspectorInfo,
					areas,
					wins,
					cleanerFeedback,
				}}
				formId={formId || "QA-PENDING"}
				onBack={() => setShowReport(false)}
			/>
		);
	}

	// Mobile camera component
	if (showMobileCamera) {
		return (
			<MobileCamera
				onPhotoCapture={handleMobileCameraCapture}
				onClose={handleMobileCameraClose}
				maxPhotos={5}
				currentPhotoCount={
					currentPhotoContext
						? areas
								.find((a) => a.id === currentPhotoContext.areaId)
								?.items.find((i) => i.id === currentPhotoContext.itemId)?.photos
								.length || 0
						: 0
				}
			/>
		);
	}

	return (
		<div className="max-w-md mx-auto bg-white min-h-screen">
			{/* Form ID Display - Positioned at the very top */}
			<div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex-1 min-w-0">
						<Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
							Form ID
						</Label>
						<div className="text-sm font-mono font-semibold text-gray-900 mt-1 truncate">
							{formId || "Generating..."}
						</div>
					</div>
					<div className="flex items-center gap-3 ml-3">
						{/* Offline Indicator */}
						<OfflineIndicator showDetails={false} />

						{/* Copy Button - Mobile optimized */}
						<Button
							onClick={copyFormId}
							variant="outline"
							size={isMobile ? "default" : "sm"}
							disabled={!formId}
							className={cn(
								"border-gray-300 hover:bg-gray-100 disabled:opacity-50",
								isMobile ? "h-10 px-4 text-sm min-w-[80px]" : "h-8 px-3 text-xs"
							)}
						>
							{isFormIdCopied ? (
								<>
									<Check
										className={cn(
											"text-green-600",
											isMobile ? "w-4 h-4 mr-2" : "w-3 h-3 mr-1"
										)}
									/>
									<span className="text-green-600">Copied</span>
								</>
							) : (
								<>
									<Copy
										className={cn(isMobile ? "w-4 h-4 mr-2" : "w-3 h-3 mr-1")}
									/>
									Copy
								</>
							)}
						</Button>

						{/* Reset Button with Confirmation Dialog */}
						<AlertDialog
							open={showResetDialog}
							onOpenChange={setShowResetDialog}
						>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size={isMobile ? "default" : "sm"}
									className={cn(
										"border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700",
										isMobile
											? "h-10 px-4 text-sm min-w-[80px]"
											: "h-8 px-3 text-xs"
									)}
								>
									<RotateCcw
										className={cn(isMobile ? "w-4 h-4 mr-2" : "w-3 h-3 mr-1")}
									/>
									Reset
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Reset QA Checklist</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to start over? This will clear all
										form data including:
										<br />• Inspector information
										<br />• All inspection assessments
										<br />• Photos and comments
										<br />• Wins and feedback
										<br />
										<br />
										This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleResetForm}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										Yes, Reset Form
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				{/* Auto-save indicator */}
				{lastSaved && (
					<div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
						<Save className="w-3 h-3" />
						<span>Last saved: {lastSaved.toLocaleTimeString()}</span>
					</div>
				)}

				{/* Offline error display */}
				{offlineError && (
					<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
						{offlineError}
					</div>
				)}
			</div>

			{/* Header with ECS branding */}
			<div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white border-b z-10 p-4">
				<h1 className="text-xl font-bold text-center">
					Quality Assurance Checklist
				</h1>
				<p className="text-center text-sm opacity-90 mt-1">
					Element Cleaning Systems
				</p>
				<div className="text-center mt-2">
					{getStatusBadge(calculateOverallStatus())}
				</div>
			</div>

			{/* Progress Indicator */}
			<ProgressIndicator />

			{/* Step Content */}
			<div className="flex-1 overflow-y-auto">
				{/* Step 1: Inspector Information */}
				{currentStep === 0 && (
					<div className="p-4 space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Inspection Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="inspector">Inspector Name *</Label>
									<Input
										id="inspector"
										value={inspectorInfo.inspectorName}
										onChange={(e) =>
											setInspectorInfo((prev) => ({
												...prev,
												inspectorName: e.target.value,
											}))
										}
										placeholder="Enter inspector name"
										className={
											!inspectorInfo.inspectorName.trim() && currentStep === 0
												? "border-red-300"
												: ""
										}
									/>
								</div>
								<div>
									<Label htmlFor="facility">Facility Name *</Label>
									<Input
										id="facility"
										value={inspectorInfo.facilityName}
										onChange={(e) =>
											setInspectorInfo((prev) => ({
												...prev,
												facilityName: e.target.value,
											}))
										}
										placeholder="Enter facility name"
										className={
											!inspectorInfo.facilityName.trim() && currentStep === 0
												? "border-red-300"
												: ""
										}
									/>
								</div>
								<div>
									<Label htmlFor="date">Inspection Date *</Label>
									<Input
										id="date"
										type="date"
										value={inspectorInfo.date}
										onChange={(e) =>
											setInspectorInfo((prev) => ({
												...prev,
												date: e.target.value,
											}))
										}
										className={
											!inspectorInfo.date && currentStep === 0
												? "border-red-300"
												: ""
										}
									/>
								</div>
								<div>
									<Label htmlFor="shift">Shift *</Label>
									<Select
										value={inspectorInfo.shift}
										onValueChange={(value) =>
											setInspectorInfo((prev) => ({ ...prev, shift: value }))
										}
									>
										<SelectTrigger
											className={
												!inspectorInfo.shift && currentStep === 0
													? "border-red-300"
													: ""
											}
										>
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
									<Label htmlFor="team">Cleaning Team *</Label>
									<Input
										id="team"
										value={inspectorInfo.cleaningTeam}
										onChange={(e) =>
											setInspectorInfo((prev) => ({
												...prev,
												cleaningTeam: e.target.value,
											}))
										}
										placeholder="Enter team name/ID"
										className={
											!inspectorInfo.cleaningTeam.trim() && currentStep === 0
												? "border-red-300"
												: ""
										}
									/>
								</div>
								{!validateCurrentStep() && (
									<div className="text-red-600 text-sm">
										* Please fill in all required fields to continue
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Step 2: Wins This Shift */}
				{currentStep === 1 && (
					<div className="p-4 space-y-4">
						<Card className="border-green-200 bg-green-50">
							<CardHeader>
								<CardTitle className="text-green-800 flex items-center gap-2">
									<Star className="w-5 h-5" />
									Wins This Shift
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{wins.map((win, index) => (
									<div key={win.id} className="flex gap-2">
										<Textarea
											value={win.description}
											onChange={(e) => updateWin(win.id, e.target.value)}
											placeholder={`Positive highlight #${index + 1}...`}
											className="flex-1 min-h-[60px] bg-white"
										/>
										{wins.length > 1 && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => removeWin(win.id)}
												className="self-start"
											>
												<X className="w-4 h-4" />
											</Button>
										)}
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addWin}
									className="w-full border-green-300 text-green-700 hover:bg-green-100"
								>
									+ Add Another Win
								</Button>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Step 3: Team Feedback */}
				{currentStep === 2 && (
					<div className="p-4 space-y-4">
						<Card className="border-blue-200 bg-blue-50">
							<CardHeader>
								<CardTitle className="text-blue-800">
									Anything you'd like to share?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Textarea
									value={cleanerFeedback}
									onChange={(e) => setCleanerFeedback(e.target.value)}
									placeholder="Share any feedback, concerns, or suggestions..."
									className="min-h-[80px] bg-white"
								/>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Steps 4-7: Area Inspections */}
				{currentStep >= 3 && currentStep <= 6 && (
					<div className="p-4 space-y-4">
						{(() => {
							const area = areas[currentStep - 3];
							return (
								<>
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-lg font-bold">{area.name}</h2>
										{getStatusBadge(calculateAreaStatus(area))}
									</div>

									{area.items.map((item) => (
										<Card key={item.id}>
											<CardHeader>
												<div className="flex justify-between items-center">
													<CardTitle className="text-base flex items-center gap-2">
														{getStatusIcon(item.status)}
														{item.name}
													</CardTitle>
													{getStatusBadge(item.status)}
												</div>
											</CardHeader>
											<CardContent className="space-y-4">
												<StatusSelector
													value={item.status}
													onChange={(status) =>
														updateItemStatus(area.id, item.id, status)
													}
													label="Quality Assessment"
												/>

												<div>
													<Label htmlFor={`comments-${item.id}`}>
														{item.status === "yellow"
															? "Room to Grow"
															: item.status === "red"
															? "High Priority Follow-Up"
															: "Comments"}
													</Label>
													<Textarea
														id={`comments-${item.id}`}
														value={item.comments}
														onChange={(e) =>
															updateItemComments(
																area.id,
																item.id,
																e.target.value
															)
														}
														placeholder={
															item.status === "yellow"
																? "What can be improved here?"
																: item.status === "red"
																? "What needs immediate attention?"
																: "Add any notes or observations..."
														}
														className="mt-1"
													/>
												</div>

												<div>
													<Label>Photos</Label>
													<div className="flex gap-2 mt-2">
														{isMobile ? (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() =>
																	handleMobileCameraOpen(area.id, item.id)
																}
																className="flex items-center gap-2"
																disabled={item.photos.length >= 5}
															>
																<Smartphone className="w-4 h-4" />
																{item.photos.length >= 5
																	? "Max Photos"
																	: "Take Photo"}
															</Button>
														) : (
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
														)}
														<input
															ref={fileInputRef}
															type="file"
															accept="image/*"
															multiple
															capture="environment"
															className="hidden"
															onChange={(e) =>
																handlePhotoUpload(area.id, item.id, e)
															}
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
																		onClick={() =>
																			removePhoto(area.id, item.id, index)
																		}
																		className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
																	>
																		<X className="w-3 h-3" />
																	</button>
																</div>
															))}
														</div>
													)}
												</div>

												{/* Follow-up timeline */}
												{item.status !== "unset" && (
													<div className="bg-gray-50 p-3 rounded-md">
														<div className="text-sm font-medium text-gray-700">
															Follow-up Timeline: {getFollowUpTime(item.status)}
														</div>
													</div>
												)}
											</CardContent>
										</Card>
									))}

									{!validateCurrentStep() && (
										<div className="text-red-600 text-sm mt-4">
											Please assess at least one item in this area to continue
										</div>
									)}
								</>
							);
						})()}
					</div>
				)}
			</div>

			{/* Navigation Controls */}
			<div className="sticky bottom-0 bg-white border-t p-4">
				<div className="flex gap-3">
					{currentStep > 0 && (
						<Button
							onClick={handleBack}
							variant="outline"
							size={isMobile ? "lg" : "default"}
							className={cn(
								"flex items-center gap-2",
								isMobile ? "h-12 px-6 text-base min-w-[100px]" : ""
							)}
						>
							<ChevronLeft className="w-4 h-4" />
							Back
						</Button>
					)}

					<div className="flex-1" />

					{currentStep < FORM_STEPS.length - 1 ? (
						<Button
							onClick={handleNext}
							disabled={!canProceedToNext()}
							size={isMobile ? "lg" : "default"}
							className={cn(
								"bg-green-600 hover:bg-green-700 flex items-center gap-2",
								isMobile ? "h-12 px-6 text-base min-w-[100px]" : ""
							)}
						>
							Next
							<ChevronRight className="w-4 h-4" />
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							disabled={!validateCurrentStep()}
							size={isMobile ? "lg" : "default"}
							className={cn(
								"bg-green-600 hover:bg-green-700 flex items-center gap-2",
								isMobile ? "h-12 px-6 text-base min-w-[140px]" : ""
							)}
						>
							<FileText className="w-4 h-4" />
							Generate Report
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
