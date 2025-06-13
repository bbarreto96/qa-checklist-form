// IndexedDB wrapper for offline QA form storage
import type { ReportData } from "./types";

const DB_NAME = "QAChecklistDB";
const DB_VERSION = 1;
const FORMS_STORE = "qaForms";
const PENDING_STORE = "pendingForms";
const PHOTOS_STORE = "photos";

export interface StoredQAForm {
	id: string;
	formId: string;
	data: ReportData;
	timestamp: number;
	status: "draft" | "completed" | "synced";
	lastModified: number;
}

export interface PendingForm {
	id: string;
	formId: string;
	data: ReportData;
	timestamp: number;
	retryCount: number;
}

export interface StoredPhoto {
	id: string;
	formId: string;
	areaId: string;
	itemId: string;
	blob: Blob;
	timestamp: number;
}

class OfflineStorage {
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => {
				reject(new Error("Failed to open IndexedDB"));
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create forms store
				if (!db.objectStoreNames.contains(FORMS_STORE)) {
					const formsStore = db.createObjectStore(FORMS_STORE, {
						keyPath: "id",
					});
					formsStore.createIndex("formId", "formId", { unique: true });
					formsStore.createIndex("status", "status", { unique: false });
					formsStore.createIndex("timestamp", "timestamp", { unique: false });
				}

				// Create pending forms store
				if (!db.objectStoreNames.contains(PENDING_STORE)) {
					const pendingStore = db.createObjectStore(PENDING_STORE, {
						keyPath: "id",
					});
					pendingStore.createIndex("formId", "formId", { unique: false });
					pendingStore.createIndex("timestamp", "timestamp", { unique: false });
				}

				// Create photos store
				if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
					const photosStore = db.createObjectStore(PHOTOS_STORE, {
						keyPath: "id",
					});
					photosStore.createIndex("formId", "formId", { unique: false });
					photosStore.createIndex("areaId", "areaId", { unique: false });
					photosStore.createIndex("itemId", "itemId", { unique: false });
				}
			};
		});
	}

	async saveForm(form: StoredQAForm): Promise<void> {
		if (!this.db) {
			try {
				await this.init();
			} catch (err) {
				throw new Error(
					`Failed to initialize database: ${
						err instanceof Error ? err.message : "Unknown error"
					}`
				);
			}
		}

		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db!.transaction([FORMS_STORE], "readwrite");
				const store = transaction.objectStore(FORMS_STORE);
				const index = store.index("formId");

				// First, try to find existing form with same formId
				const getRequest = index.get(form.formId);

				getRequest.onsuccess = () => {
					const existingForm = getRequest.result;

					if (existingForm) {
						// Update existing form with new data but keep the original id
						const updatedForm = {
							...form,
							id: existingForm.id, // Keep the original id to maintain uniqueness
							lastModified: Date.now(),
						};

						const putRequest = store.put(updatedForm);
						putRequest.onsuccess = () => resolve();
						putRequest.onerror = () =>
							reject(
								new Error(
									`Failed to update form: ${
										putRequest.error?.message || "Unknown error"
									}`
								)
							);
					} else {
						// No existing form, create new one
						const putRequest = store.put(form);
						putRequest.onsuccess = () => resolve();
						putRequest.onerror = () =>
							reject(
								new Error(
									`Failed to save form: ${
										putRequest.error?.message || "Unknown error"
									}`
								)
							);
					}
				};

				getRequest.onerror = () =>
					reject(
						new Error(
							`Failed to check existing form: ${
								getRequest.error?.message || "Unknown error"
							}`
						)
					);

				transaction.onerror = () =>
					reject(
						new Error(
							`Transaction failed: ${
								transaction.error?.message || "Unknown error"
							}`
						)
					);
			} catch (err) {
				reject(
					new Error(
						`Failed to create transaction: ${
							err instanceof Error ? err.message : "Unknown error"
						}`
					)
				);
			}
		});
	}

	async getForm(formId: string): Promise<StoredQAForm | null> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([FORMS_STORE], "readonly");
			const store = transaction.objectStore(FORMS_STORE);
			const index = store.index("formId");
			const request = index.get(formId);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(new Error("Failed to get form"));
		});
	}

	async getAllForms(): Promise<StoredQAForm[]> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([FORMS_STORE], "readonly");
			const store = transaction.objectStore(FORMS_STORE);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(new Error("Failed to get all forms"));
		});
	}

	async deleteForm(formId: string): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([FORMS_STORE], "readwrite");
			const store = transaction.objectStore(FORMS_STORE);
			const index = store.index("formId");
			const request = index.getKey(formId);

			request.onsuccess = () => {
				if (request.result) {
					const deleteRequest = store.delete(request.result);
					deleteRequest.onsuccess = () => resolve();
					deleteRequest.onerror = () =>
						reject(new Error("Failed to delete form"));
				} else {
					resolve(); // Form doesn't exist
				}
			};
			request.onerror = () =>
				reject(new Error("Failed to find form for deletion"));
		});
	}

	async savePendingForm(form: PendingForm): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PENDING_STORE], "readwrite");
			const store = transaction.objectStore(PENDING_STORE);
			const request = store.put(form);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error("Failed to save pending form"));
		});
	}

	async getPendingForms(): Promise<PendingForm[]> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PENDING_STORE], "readonly");
			const store = transaction.objectStore(PENDING_STORE);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(new Error("Failed to get pending forms"));
		});
	}

	async removePendingForm(id: string): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PENDING_STORE], "readwrite");
			const store = transaction.objectStore(PENDING_STORE);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () =>
				reject(new Error("Failed to remove pending form"));
		});
	}

	async savePhoto(photo: StoredPhoto): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PHOTOS_STORE], "readwrite");
			const store = transaction.objectStore(PHOTOS_STORE);
			const request = store.put(photo);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(new Error("Failed to save photo"));
		});
	}

	async getPhotosForForm(formId: string): Promise<StoredPhoto[]> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PHOTOS_STORE], "readonly");
			const store = transaction.objectStore(PHOTOS_STORE);
			const index = store.index("formId");
			const request = index.getAll(formId);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () =>
				reject(new Error("Failed to get photos for form"));
		});
	}

	async deletePhotosForForm(formId: string): Promise<void> {
		if (!this.db) await this.init();

		const photos = await this.getPhotosForForm(formId);

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([PHOTOS_STORE], "readwrite");
			const store = transaction.objectStore(PHOTOS_STORE);

			let deletedCount = 0;
			const totalPhotos = photos.length;

			if (totalPhotos === 0) {
				resolve();
				return;
			}

			photos.forEach((photo) => {
				const request = store.delete(photo.id);
				request.onsuccess = () => {
					deletedCount++;
					if (deletedCount === totalPhotos) {
						resolve();
					}
				};
				request.onerror = () => reject(new Error("Failed to delete photo"));
			});
		});
	}

	async getStorageUsage(): Promise<{ used: number; quota: number }> {
		if ("storage" in navigator && "estimate" in navigator.storage) {
			const estimate = await navigator.storage.estimate();
			return {
				used: estimate.usage || 0,
				quota: estimate.quota || 0,
			};
		}
		return { used: 0, quota: 0 };
	}

	async clearAllData(): Promise<void> {
		if (!this.db) await this.init();

		const stores = [FORMS_STORE, PENDING_STORE, PHOTOS_STORE];

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(stores, "readwrite");
			let clearedCount = 0;

			stores.forEach((storeName) => {
				const store = transaction.objectStore(storeName);
				const request = store.clear();

				request.onsuccess = () => {
					clearedCount++;
					if (clearedCount === stores.length) {
						resolve();
					}
				};
				request.onerror = () =>
					reject(new Error(`Failed to clear ${storeName}`));
			});
		});
	}
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();
