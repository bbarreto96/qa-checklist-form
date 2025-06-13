import { google } from 'googleapis';
import { SheetsSubmissionData } from './types';

// Initialize Google Sheets API client
export function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!clientEmail || !privateKey) {
    throw new Error('Google Sheets credentials not configured. Please check your environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Get spreadsheet configuration
export function getSpreadsheetConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'QA Reports';
  
  if (!spreadsheetId) {
    throw new Error('Google Sheets spreadsheet ID not configured. Please check your environment variables.');
  }

  return { spreadsheetId, sheetName };
}

// Define the header row for the Google Sheet
export const SHEET_HEADERS = [
  'Submission Date',
  'Form ID',
  'Inspector Name',
  'Facility Name',
  'Inspection Date',
  'Shift',
  'Cleaning Team',
  'Overall Status',
  'Total Items',
  'Green Count',
  'Yellow Count',
  'Red Count',
  'Total Areas',
  'Wins Count',
  'Wins Details',
  'Cleaner Feedback',
  'Inspector Signature',
  'Cleaner Name',
  'Cleaner Signature',
  'Excellent Items Count',
  'Room to Grow Count',
  'High Priority Count',
  'Area Breakdown',
  'Excellent Items Details',
  'Room to Grow Details',
  'High Priority Details'
];

// Convert submission data to spreadsheet row
export function formatDataForSheet(data: SheetsSubmissionData): string[] {
  const winsDetails = data.wins
    .filter(win => win.description.trim())
    .map(win => win.description)
    .join(' | ');

  const areaBreakdown = data.areaBreakdown
    .map(area => `${area.areaName}: ${area.greenCount}G/${area.yellowCount}Y/${area.redCount}R (${area.status})`)
    .join(' | ');

  const excellentDetails = data.categorizedItems.excellent
    .map(item => `${item.area}: ${item.item}${item.comments ? ` - ${item.comments}` : ''}`)
    .join(' | ');

  const roomToGrowDetails = data.categorizedItems.roomToGrow
    .map(item => `${item.area}: ${item.item}${item.comments ? ` - ${item.comments}` : ''}`)
    .join(' | ');

  const highPriorityDetails = data.categorizedItems.highPriority
    .map(item => `${item.area}: ${item.item}${item.comments ? ` - ${item.comments}` : ''}`)
    .join(' | ');

  return [
    data.submissionTimestamp,
    data.formId,
    data.inspectorInfo.inspectorName,
    data.inspectorInfo.facilityName,
    data.inspectorInfo.date,
    data.inspectorInfo.shift,
    data.inspectorInfo.cleaningTeam,
    data.overallStatus,
    data.totalItems.toString(),
    data.statusCounts.green.toString(),
    data.statusCounts.yellow.toString(),
    data.statusCounts.red.toString(),
    data.totalAreas.toString(),
    data.wins.filter(win => win.description.trim()).length.toString(),
    winsDetails,
    data.cleanerFeedback,
    data.signatures.inspectorSignature,
    data.signatures.cleanerName,
    data.signatures.cleanerSignature,
    data.categorizedItems.excellent.length.toString(),
    data.categorizedItems.roomToGrow.length.toString(),
    data.categorizedItems.highPriority.length.toString(),
    areaBreakdown,
    excellentDetails,
    roomToGrowDetails,
    highPriorityDetails
  ];
}

// Ensure the sheet has proper headers
export async function ensureSheetHeaders(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    // Check if the sheet exists and has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const existingHeaders = response.data.values?.[0] || [];
    
    // If no headers or headers don't match, set them
    if (existingHeaders.length === 0 || !arraysEqual(existingHeaders, SHEET_HEADERS)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SHEET_HEADERS],
        },
      });
    }
  } catch (error) {
    // If sheet doesn't exist, create it
    if (error instanceof Error && error.message.includes('Unable to parse range')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          }],
        },
      });
      
      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SHEET_HEADERS],
        },
      });
    } else {
      throw error;
    }
  }
}

// Helper function to compare arrays
function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Submit data to Google Sheets
export async function submitToGoogleSheets(data: SheetsSubmissionData): Promise<{ success: boolean; rowNumber?: number; error?: string }> {
  try {
    const sheets = getGoogleSheetsClient();
    const { spreadsheetId, sheetName } = getSpreadsheetConfig();

    // Ensure headers are in place
    await ensureSheetHeaders(sheets, spreadsheetId, sheetName);

    // Format data for the sheet
    const rowData = formatDataForSheet(data);

    // Append the data
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    // Extract row number from the response
    const updatedRange = response.data.updates?.updatedRange;
    const rowNumber = updatedRange ? parseInt(updatedRange.split('!')[1].split(':')[0].replace(/\D/g, '')) : undefined;

    return { success: true, rowNumber };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
