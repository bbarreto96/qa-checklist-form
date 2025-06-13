"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Wifi,
	WifiOff,
	Cloud,
	CloudOff,
	RotateCw,
	AlertCircle,
	CheckCircle,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOfflineStorage } from "@/hooks/use-offline-storage";

interface OfflineIndicatorProps {
	className?: string;
	showDetails?: boolean;
}

export default function OfflineIndicator({
	className,
	showDetails = false,
}: OfflineIndicatorProps) {
	const {
		isOnline,
		isInitialized,
		syncPendingForms,
		getPendingFormsCount,
		storageUsage,
		error,
	} = useOfflineStorage();

	const [pendingCount, setPendingCount] = useState(0);
	const [isSyncing, setIsSyncing] = useState(false);
	const [showDetailCard, setShowDetailCard] = useState(false);
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

	// Update pending forms count
	useEffect(() => {
		const updatePendingCount = async () => {
			const count = await getPendingFormsCount();
			setPendingCount(count);
		};

		updatePendingCount();

		// Update every 30 seconds
		const interval = setInterval(updatePendingCount, 30000);
		return () => clearInterval(interval);
	}, [getPendingFormsCount]);

	const handleSync = async () => {
		if (!isOnline || isSyncing) return;

		setIsSyncing(true);
		try {
			await syncPendingForms();
			setLastSyncTime(new Date());

			// Update pending count after sync
			const count = await getPendingFormsCount();
			setPendingCount(count);
		} catch (err) {
			console.error("Sync failed:", err);
		} finally {
			setIsSyncing(false);
		}
	};

	// Auto-sync when coming online
	useEffect(() => {
		if (isOnline && pendingCount > 0) {
			handleSync();
		}
	}, [isOnline, pendingCount]); // Added pendingCount to dependencies

	const formatStorageUsage = () => {
		const usedMB = (storageUsage.used / (1024 * 1024)).toFixed(1);
		const quotaMB = (storageUsage.quota / (1024 * 1024)).toFixed(0);
		return `${usedMB} MB / ${quotaMB} MB`;
	};

	const getStatusColor = () => {
		if (!isInitialized) return "bg-gray-500";
		if (!isOnline) return "bg-red-500";
		if (pendingCount > 0) return "bg-yellow-500";
		return "bg-green-500";
	};

	const getStatusText = () => {
		if (!isInitialized) return "Initializing...";
		if (!isOnline) return "Offline";
		if (pendingCount > 0) return `${pendingCount} pending`;
		return "Online";
	};

	const getStatusIcon = () => {
		if (!isInitialized) return <RotateCw className="w-3 h-3 animate-spin" />;
		if (!isOnline) return <WifiOff className="w-3 h-3" />;
		if (pendingCount > 0) return <CloudOff className="w-3 h-3" />;
		return <Wifi className="w-3 h-3" />;
	};

	if (!showDetails) {
		return (
			<Badge
				variant="outline"
				className={cn(
					"flex items-center gap-1 text-xs font-medium transition-colors",
					getStatusColor(),
					"text-white border-transparent",
					className
				)}
				onClick={() => setShowDetailCard(!showDetailCard)}
			>
				{getStatusIcon()}
				{getStatusText()}
			</Badge>
		);
	}

	return (
		<div className={cn("relative", className)}>
			<Badge
				variant="outline"
				className={cn(
					"flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer",
					getStatusColor(),
					"text-white border-transparent"
				)}
				onClick={() => setShowDetailCard(!showDetailCard)}
			>
				{getStatusIcon()}
				{getStatusText()}
			</Badge>

			{showDetailCard && (
				<Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg border">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-semibold text-sm">Connection Status</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowDetailCard(false)}
								className="h-6 w-6 p-0"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>

						<div className="space-y-3">
							{/* Connection Status */}
							<div className="flex items-center gap-2">
								{isOnline ? (
									<>
										<Wifi className="w-4 h-4 text-green-600" />
										<span className="text-sm text-green-600 font-medium">
											Online
										</span>
									</>
								) : (
									<>
										<WifiOff className="w-4 h-4 text-red-600" />
										<span className="text-sm text-red-600 font-medium">
											Offline
										</span>
									</>
								)}
							</div>

							{/* Pending Forms */}
							{pendingCount > 0 && (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<CloudOff className="w-4 h-4 text-yellow-600" />
										<span className="text-sm">
											{pendingCount} form{pendingCount !== 1 ? "s" : ""} pending
											sync
										</span>
									</div>
									{isOnline && (
										<Button
											size="sm"
											variant="outline"
											onClick={handleSync}
											disabled={isSyncing}
											className="h-7 px-2 text-xs"
										>
											{isSyncing ? (
												<RotateCw className="w-3 h-3 animate-spin" />
											) : (
												"Sync Now"
											)}
										</Button>
									)}
								</div>
							)}

							{/* Last Sync Time */}
							{lastSyncTime && (
								<div className="flex items-center gap-2 text-xs text-gray-600">
									<CheckCircle className="w-3 h-3" />
									<span>Last sync: {lastSyncTime.toLocaleTimeString()}</span>
								</div>
							)}

							{/* Storage Usage */}
							{storageUsage.quota > 0 && (
								<div className="text-xs text-gray-600">
									<div className="flex justify-between items-center mb-1">
										<span>Storage used:</span>
										<span>{formatStorageUsage()}</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-1.5">
										<div
											className="bg-blue-600 h-1.5 rounded-full transition-all"
											style={{
												width: `${Math.min(
													(storageUsage.used / storageUsage.quota) * 100,
													100
												)}%`,
											}}
										/>
									</div>
								</div>
							)}

							{/* Error Display */}
							{error && (
								<div className="flex items-start gap-2 p-2 bg-red-50 rounded text-xs">
									<AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
									<span className="text-red-700">{error}</span>
								</div>
							)}

							{/* Offline Features */}
							{!isOnline && (
								<div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
									<div className="font-medium mb-1">Available offline:</div>
									<ul className="space-y-0.5 text-xs">
										<li>• Complete QA inspections</li>
										<li>• Take photos and add comments</li>
										<li>• Generate PDF reports</li>
										<li>• Auto-sync when back online</li>
									</ul>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
