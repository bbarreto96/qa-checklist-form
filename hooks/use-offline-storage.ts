import { useState, useEffect, useCallback } from "react";
import {
	offlineStorage,
	type StoredQAForm,
	type PendingForm,
} from "@/lib/offline-storage";
import type { ReportData } from "@/lib/types";

export interface UseOfflineStorageReturn {
	isOnline: boolean;
	isInitialized: boolean;
	saveFormData: (
		formId: string,
		data: ReportData,
		status?: "draft" | "completed"
	) => Promise<void>;
	loadFormData: (formId: string) => Promise<ReportData | null>;
	getAllSavedForms: () => Promise<StoredQAForm[]>;
	deleteFormData: (formId: string) => Promise<void>;
	syncPendingForms: () => Promise<void>;
	getPendingFormsCount: () => Promise<number>;
	clearAllData: () => Promise<void>;
	storageUsage: { used: number; quota: number };
	error: string | null;
}

export function useOfflineStorage(): UseOfflineStorageReturn {
	const [isOnline, setIsOnline] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0 });
	const [error, setError] = useState<string | null>(null);

	// Initialize offline storage
	useEffect(() => {
		const initStorage = async () => {
			try {
				// Check if IndexedDB is available
				if (!("indexedDB" in window)) {
					throw new Error("IndexedDB not supported in this browser");
				}

				await offlineStorage.init();
				setIsInitialized(true);

				// Update storage usage
				const usage = await offlineStorage.getStorageUsage();
				setStorageUsage(usage);
			} catch (err) {
				console.error("Failed to initialize offline storage:", err);
				setError(
					err instanceof Error ? err.message : "Failed to initialize storage"
				);
				// Still set initialized to true so the app can work without offline features
				setIsInitialized(true);
			}
		};

		initStorage();
	}, []);

	// Monitor online/offline status
	useEffect(() => {
		const updateOnlineStatus = () => {
			setIsOnline(navigator.onLine);
		};

		// Set initial status
		updateOnlineStatus();

		// Listen for online/offline events
		window.addEventListener("online", updateOnlineStatus);
		window.addEventListener("offline", updateOnlineStatus);

		return () => {
			window.removeEventListener("online", updateOnlineStatus);
			window.removeEventListener("offline", updateOnlineStatus);
		};
	}, []);

	// Define syncPendingForms first
	const syncPendingForms = useCallback(async (): Promise<void> => {
		if (!isOnline) return;

		try {
			setError(null);
			const pendingForms = await offlineStorage.getPendingForms();

			for (const form of pendingForms) {
				try {
					// Attempt to submit the form to the server
					const response = await fetch("/api/submit-qa-form", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							formId: form.formId,
							data: form.data,
							timestamp: form.timestamp,
						}),
					});

					if (response.ok) {
						// Successfully synced, remove from pending queue
						await offlineStorage.removePendingForm(form.id);

						// Update the main form status to synced
						const mainForm = await offlineStorage.getForm(form.formId);
						if (mainForm) {
							mainForm.status = "synced";
							await offlineStorage.saveForm(mainForm);
						}
					} else {
						// Increment retry count
						form.retryCount++;
						if (form.retryCount < 3) {
							await offlineStorage.savePendingForm(form);
						} else {
							// Max retries reached, remove from queue
							await offlineStorage.removePendingForm(form.id);
							console.error("Max retries reached for form:", form.formId);
						}
					}
				} catch (err) {
					console.error("Failed to sync form:", form.formId, err);

					// Increment retry count
					form.retryCount++;
					if (form.retryCount < 3) {
						await offlineStorage.savePendingForm(form);
					} else {
						await offlineStorage.removePendingForm(form.id);
					}
				}
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to sync pending forms";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, [isOnline]);

	// Auto-sync when coming back online
	useEffect(() => {
		if (isOnline && isInitialized) {
			syncPendingForms().catch((err) => {
				console.error("Auto-sync failed:", err);
			});
		}
	}, [isOnline, isInitialized, syncPendingForms]);

	const saveFormData = useCallback(
		async (
			formId: string,
			data: ReportData,
			status: "draft" | "completed" = "draft"
		): Promise<void> => {
			try {
				setError(null);

				// Check if IndexedDB is available
				if (!("indexedDB" in window)) {
					console.warn("IndexedDB not available, using localStorage fallback");
					// Fallback to localStorage for basic functionality
					const fallbackData = {
						formId,
						data,
						timestamp: Date.now(),
						status,
					};
					localStorage.setItem(
						`qa_form_${formId}`,
						JSON.stringify(fallbackData)
					);
					return;
				}

				const storedForm: StoredQAForm = {
					id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					formId,
					data,
					timestamp: Date.now(),
					status,
					lastModified: Date.now(),
				};

				await offlineStorage.saveForm(storedForm);

				// Update storage usage
				const usage = await offlineStorage.getStorageUsage();
				setStorageUsage(usage);

				// If completed and offline, add to pending queue
				if (status === "completed" && !isOnline) {
					const pendingForm: PendingForm = {
						id: `pending_${Date.now()}_${Math.random()
							.toString(36)
							.substr(2, 9)}`,
						formId,
						data,
						timestamp: Date.now(),
						retryCount: 0,
					};

					await offlineStorage.savePendingForm(pendingForm);

					// Register for background sync if available
					if (
						"serviceWorker" in navigator &&
						"sync" in window.ServiceWorkerRegistration.prototype
					) {
						const registration = await navigator.serviceWorker.ready;
						await registration.sync.register("qa-form-sync");
					}
				}
			} catch (err) {
				console.error("Failed to save form data:", err);
				// Don't throw error for auto-save to prevent disrupting user experience
				const errorMessage =
					err instanceof Error ? err.message : "Failed to save form data";
				setError(errorMessage);

				// Only throw if this is a manual save (completed status)
				if (status === "completed") {
					throw new Error(errorMessage);
				}
			}
		},
		[isOnline]
	);

	const loadFormData = useCallback(
		async (formId: string): Promise<ReportData | null> => {
			try {
				setError(null);
				const storedForm = await offlineStorage.getForm(formId);
				return storedForm ? storedForm.data : null;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to load form data";
				setError(errorMessage);
				return null;
			}
		},
		[]
	);

	const getAllSavedForms = useCallback(async (): Promise<StoredQAForm[]> => {
		try {
			setError(null);
			return await offlineStorage.getAllForms();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to get saved forms";
			setError(errorMessage);
			return [];
		}
	}, []);

	const deleteFormData = useCallback(async (formId: string): Promise<void> => {
		try {
			setError(null);
			await offlineStorage.deleteForm(formId);
			await offlineStorage.deletePhotosForForm(formId);

			// Update storage usage
			const usage = await offlineStorage.getStorageUsage();
			setStorageUsage(usage);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to delete form data";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	const getPendingFormsCount = useCallback(async (): Promise<number> => {
		try {
			const pendingForms = await offlineStorage.getPendingForms();
			return pendingForms.length;
		} catch (err) {
			console.error("Failed to get pending forms count:", err);
			return 0;
		}
	}, []);

	const clearAllData = useCallback(async (): Promise<void> => {
		try {
			setError(null);
			await offlineStorage.clearAllData();

			// Update storage usage
			const usage = await offlineStorage.getStorageUsage();
			setStorageUsage(usage);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to clear all data";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	return {
		isOnline,
		isInitialized,
		saveFormData,
		loadFormData,
		getAllSavedForms,
		deleteFormData,
		syncPendingForms,
		getPendingFormsCount,
		clearAllData,
		storageUsage,
		error,
	};
}
