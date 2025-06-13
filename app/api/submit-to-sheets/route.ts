import { NextRequest, NextResponse } from 'next/server';
import { submitToGoogleSheets } from '@/lib/google-sheets';
import { SheetsSubmissionData, SheetsSubmissionResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const submissionData: SheetsSubmissionData = await request.json();

    // Validate required fields
    if (!submissionData.formId || !submissionData.inspectorInfo.inspectorName) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields',
          error: 'Form ID and Inspector Name are required'
        } as SheetsSubmissionResponse,
        { status: 400 }
      );
    }

    // Submit to Google Sheets
    const result = await submitToGoogleSheets(submissionData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Report successfully submitted to Google Sheets${result.rowNumber ? ` (Row ${result.rowNumber})` : ''}`,
        rowNumber: result.rowNumber
      } as SheetsSubmissionResponse);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit report to Google Sheets',
          error: result.error
        } as SheetsSubmissionResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('credentials not configured')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Google Sheets integration not configured',
            error: 'Please contact your administrator to set up Google Sheets integration'
          } as SheetsSubmissionResponse,
          { status: 503 }
        );
      }
      
      if (error.message.includes('spreadsheet ID not configured')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Google Sheets spreadsheet not configured',
            error: 'Please contact your administrator to configure the target spreadsheet'
          } as SheetsSubmissionResponse,
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as SheetsSubmissionResponse,
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method not allowed',
      error: 'This endpoint only accepts POST requests'
    } as SheetsSubmissionResponse,
    { status: 405 }
  );
}
