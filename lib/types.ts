// Shared types for QA Report and Google Sheets integration

export type QAStatus = "green" | "yellow" | "red" | "unset";

export interface InspectionItem {
  id: string;
  name: string;
  status: QAStatus;
  comments: string;
  photos: string[];
}

export interface InspectionArea {
  id: string;
  name: string;
  items: InspectionItem[];
  weight: number;
}

export interface WinsEntry {
  id: string;
  description: string;
}

export interface ReportData {
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

export interface QAReportProps {
  data: ReportData;
  formId: string;
  onBack: () => void;
}

// Google Sheets submission types
export interface SheetsSubmissionData {
  formId: string;
  submissionTimestamp: string;
  inspectorInfo: ReportData['inspectorInfo'];
  overallStatus: QAStatus;
  statusCounts: {
    green: number;
    yellow: number;
    red: number;
  };
  totalItems: number;
  totalAreas: number;
  wins: WinsEntry[];
  cleanerFeedback: string;
  signatures: {
    inspectorSignature: string;
    cleanerSignature: string;
    cleanerName: string;
  };
  categorizedItems: {
    excellent: Array<{
      area: string;
      item: string;
      comments: string;
    }>;
    roomToGrow: Array<{
      area: string;
      item: string;
      comments: string;
      photos: string[];
    }>;
    highPriority: Array<{
      area: string;
      item: string;
      comments: string;
      photos: string[];
    }>;
  };
  areaBreakdown: Array<{
    areaName: string;
    weight: number;
    itemCount: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    status: QAStatus;
  }>;
}

export interface SheetsSubmissionResponse {
  success: boolean;
  message: string;
  rowNumber?: number;
  error?: string;
}
