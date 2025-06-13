# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the QA Report submission feature.

## Overview

The QA Report component now includes a "Submit to Sheets" button that allows users to submit completed inspection reports directly to a Google Sheets spreadsheet. This feature automatically organizes all report data including:

- Inspector and facility information
- Overall status and item counts
- Categorized inspection items (excellent, room to grow, high priority)
- Wins and team feedback
- Signatures and timestamps
- Area breakdown with detailed metrics

## Prerequisites

1. A Google Cloud Platform account
2. A Google Sheets spreadsheet where you want to store the reports
3. Basic understanding of Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `qa-reports-service`
   - Description: `Service account for QA report submissions`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In the "Credentials" page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Select "JSON" format and click "Create"
6. Download the JSON file and keep it secure

## Step 5: Create Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it something like "QA Reports Database"
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

## Step 6: Share Spreadsheet with Service Account

1. In your Google Sheets spreadsheet, click "Share"
2. Add the service account email (found in the JSON file as `client_email`)
3. Give it "Editor" permissions
4. Click "Send"

## Step 7: Configure Environment Variables

1. In your project root, create or update the `.env.local` file
2. Add the following variables using values from your downloaded JSON file:

```env
# Google Sheets API Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-here
GOOGLE_SHEETS_SHEET_NAME=QA Reports
```

### Important Notes:
- Replace `your-service-account@your-project.iam.gserviceaccount.com` with the `client_email` from your JSON file
- Replace `YOUR_PRIVATE_KEY_HERE` with the `private_key` from your JSON file (keep the `\n` characters)
- Replace `your-spreadsheet-id-here` with your actual spreadsheet ID
- The `GOOGLE_SHEETS_SHEET_NAME` is optional and defaults to "QA Reports"

## Step 8: Test the Integration

1. Start your development server: `npm run dev` or `pnpm dev`
2. Complete a QA inspection form
3. Fill in the signatures in the report
4. Click the "Submit to Sheets" button
5. Check your Google Sheets spreadsheet for the new data

## Spreadsheet Structure

The integration automatically creates headers and organizes data in the following columns:

- Submission Date
- Form ID
- Inspector Name
- Facility Name
- Inspection Date
- Shift
- Cleaning Team
- Overall Status
- Total Items
- Green/Yellow/Red Counts
- Total Areas
- Wins Count & Details
- Cleaner Feedback
- Signatures
- Categorized Items (Excellent, Room to Grow, High Priority)
- Area Breakdown

## Troubleshooting

### Common Issues:

1. **"Google Sheets credentials not configured"**
   - Check that all environment variables are set correctly
   - Ensure the private key includes proper line breaks (`\n`)

2. **"Permission denied"**
   - Verify the service account email has been shared with the spreadsheet
   - Check that the service account has "Editor" permissions

3. **"Spreadsheet not found"**
   - Verify the spreadsheet ID is correct
   - Ensure the spreadsheet exists and is accessible

4. **"Sheet not found"**
   - Check the `GOOGLE_SHEETS_SHEET_NAME` environment variable
   - The integration will create the sheet if it doesn't exist

### Security Best Practices:

1. Never commit the `.env.local` file to version control
2. Keep your service account JSON file secure
3. Regularly rotate your service account keys
4. Use different service accounts for different environments (dev/staging/prod)

## Features

- **Automatic Headers**: The integration automatically creates and maintains proper column headers
- **Data Validation**: Validates required fields before submission
- **Error Handling**: Provides clear error messages for common issues
- **Loading States**: Shows submission progress with loading indicators
- **Success Feedback**: Confirms successful submissions with row numbers
- **Signature Validation**: Requires both inspector and team member signatures before submission

## Support

If you encounter issues with the Google Sheets integration, check:
1. Environment variables are correctly set
2. Service account has proper permissions
3. Spreadsheet is shared with the service account
4. Google Sheets API is enabled in your Google Cloud project
