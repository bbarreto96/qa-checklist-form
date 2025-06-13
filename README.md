# Quality Assurance Checklist - Element Cleaning Systems

A modern, morale-positive Quality Assurance application for janitorial inspections, featuring tier-based grading and collaborative language.

## 🌟 Key Features

### ✅ **Tier-Based Grading System**

- **🟢 Green (Good)**: Excellent performance, no follow-up needed
- **🟡 Yellow (Needs Attention)**: Room for improvement, 3-day follow-up
- **🔴 Red (Urgent)**: High priority issues, 24-hour follow-up

### 🎯 **Morale-Positive Language**

- "Wins This Shift" section for highlighting positive achievements
- "Room to Grow" instead of "Needs Improvement"
- "High Priority Follow-Up" instead of "Urgent Issues"
- "QA Feedback Summary" instead of "Executive Summary"

### 🎨 **Element Cleaning Systems Branding**

- **Primary Green**: #4BAA47
- **Charcoal**: #474D53
- **Typography**: Poppins font family
- Professional, clean design optimized for mobile/tablet

### 📱 **Mobile-First Design**

- Touch-friendly interface
- Optimized for tablets and smartphones
- Responsive layout that works on all devices

### 📊 **Enhanced Reporting**

- No numerical scores visible to cleaners (maintains backend values for reporting)
- Color-coded status badges throughout
- Automatic follow-up timeline assignment
- Photo upload and management
- Digital signature capture for both inspector and cleaner
- **Google Sheets Integration**: Submit completed reports directly to spreadsheets

### 🔄 **Collaborative Features**

- Cleaner feedback section ("Anything you'd like to share?")
- Team member signature and acknowledgment
- Positive reinforcement through "Wins" tracking

## 🏗️ **Technical Architecture**

### **Components Structure**

```
components/
├── qa-checklist.tsx          # Main QA form component with offline capabilities
├── qa-report.tsx             # Report generation and display
├── mobile-camera.tsx         # Mobile-optimized camera component
├── offline-indicator.tsx     # Network status and sync indicator
├── mobile-janitorial-checklist.tsx  # Legacy component (kept for reference)
└── ui/                       # Reusable UI components
```

### **Mobile & Offline Infrastructure**

```
lib/
├── offline-storage.ts        # IndexedDB wrapper for offline data
├── types.ts                  # Shared TypeScript interfaces
└── utils.ts                  # Utility functions

hooks/
├── use-offline-storage.ts    # React hook for offline functionality
├── use-mobile.tsx           # Mobile device detection
└── use-toast.ts             # Toast notifications

public/
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker for offline functionality
├── offline.html             # Offline fallback page
└── icons/                   # PWA icons for various devices
```

### **Key Technologies**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with mobile-first approach
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **IndexedDB** - Client-side database for offline storage
- **Service Workers** - Background sync and caching
- **PWA** - Progressive Web App capabilities

## 📱 **Mobile Optimization Features**

### **Progressive Web App (PWA)**

- **Installable**: Add to home screen on iOS/Android
- **Offline-first**: Works without internet connection
- **App-like experience**: Full-screen, native feel
- **Background sync**: Auto-sync when connection returns

### **Mobile-Optimized UI**

- **Touch-friendly**: Large touch targets (44px minimum)
- **Responsive design**: Optimized for iPhone/iPad screens
- **Safe area support**: Handles notches and home indicators
- **High contrast mode**: Better visibility in outdoor conditions

### **Enhanced Camera Integration**

- **Native camera access**: Direct camera integration
- **Photo optimization**: Automatic compression and resizing
- **Multiple capture modes**: Front/back camera switching
- **Zoom controls**: Digital zoom for detailed shots
- **Flash support**: LED flash control

### **Offline Capabilities**

- **Local storage**: IndexedDB for form data and photos
- **Auto-save**: Continuous form state preservation
- **Sync queue**: Pending submissions when offline
- **Storage management**: Usage monitoring and cleanup

### **Field-Optimized Features**

- **Glove-friendly**: Large buttons and simplified navigation
- **Battery efficient**: Optimized for extended field use
- **Network resilient**: Graceful handling of poor connectivity
- **Data compression**: Efficient photo and form data storage

## 🔧 **Installation & Setup**

### **Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Mobile Testing**

1. **Local Network Testing**:

   ```bash
   # Find your local IP
   ipconfig getifaddr en0  # macOS
   ip route get 1 | awk '{print $7}' # Linux

   # Access from mobile device
   http://[YOUR_IP]:3000
   ```

2. **PWA Installation**:
   - Open in mobile browser
   - Tap "Add to Home Screen" (iOS) or "Install" (Android)
   - App will appear on home screen

### **Production Deployment**

- Deploy to Vercel, Netlify, or any Node.js hosting
- Ensure HTTPS for PWA features
- Configure service worker caching strategy

### **Data Structure**

```typescript
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
```

## 🚀 **Getting Started**

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/qa-checklist-form.git
cd qa-checklist-form

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local

# Configure Google Sheets integration (see GOOGLE_SHEETS_SETUP.md)

# Start development server
npm run dev
# or
pnpm dev
```

### Environment Setup

1. **Copy environment template**:

   ```bash
   cp .env.example .env.local
   ```

2. **Configure Google Sheets integration** (optional but recommended):

   - Follow the detailed guide in [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
   - Set up Google Cloud project and service account
   - Configure environment variables in `.env.local`

3. **Environment Variables**:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
   GOOGLE_SHEETS_SHEET_NAME=QA Reports
   ```

### Usage

1. **Fill Inspector Information**: Enter inspector name, facility, date, shift, and team
2. **Add Wins**: Document positive highlights from the shift
3. **Inspect Areas**: Rate each area using the tier system (Green/Yellow/Red)
4. **Add Comments**: Provide specific feedback using collaborative language
5. **Upload Photos**: Capture evidence for areas needing attention
6. **Cleaner Feedback**: Allow team members to share input
7. **Generate Report**: Create branded PDF with signatures
8. **Submit to Google Sheets**: Store completed reports in spreadsheets for tracking and analysis

## 📋 **Inspection Areas**

### **Restrooms** (25% weight)

- Toilets & Urinals
- Sinks & Mirrors
- Floor & Drains
- Supplies & Dispensers

### **Offices** (30% weight)

- Desks & Workstations
- Floors & Carpets
- Trash & Recycling
- Windows & Glass

### **Common Areas** (25% weight)

- Lobby & Reception
- Kitchen & Break Room
- Hallways & Stairs
- Elevators

### **Exterior** (20% weight)

- Entrance & Exits
- Parking Areas
- Landscaping Areas

## 📄 **Report Features**

### **PDF Export**

- Element Cleaning Systems branding
- Tier-based status indicators
- Automatic follow-up timelines
- Photo inclusion
- Digital signatures
- Professional formatting

### **Report Sections**

1. **Inspection Details** - Basic information and metadata
2. **Wins This Shift** - Positive achievements and highlights
3. **QA Summary** - Overview of status counts and follow-up requirements
4. **Excellent Performance** - Green status items
5. **Room to Grow** - Yellow status items with 3-day follow-up
6. **High Priority Follow-Up** - Red status items with 24-hour follow-up
7. **Team Feedback** - Cleaner input and suggestions
8. **Signatures** - Inspector and team member acknowledgment

## 🎨 **Design System**

### **Colors**

```css
/* ECS Brand Colors */
--ecs-green: #4BAA47
--ecs-charcoal: #474D53

/* QA Status Colors */
--qa-green: #22c55e (Good)
--qa-yellow: #eab308 (Needs Attention)
--qa-red: #ef4444 (Urgent)
```

### **Typography**

- **Primary Font**: Poppins
- **Weights**: 300, 400, 500, 600, 700
- **Fallbacks**: Arial, Helvetica, sans-serif

## 🔄 **Migration from Legacy System**

### **What Changed**

- ❌ Removed 1-5 star rating system
- ❌ Removed percentage scores visible to cleaners
- ✅ Added tier-based Green/Yellow/Red system
- ✅ Added "Wins This Shift" section
- ✅ Updated language to be more collaborative
- ✅ Added automatic follow-up timelines
- ✅ Enhanced branding and visual design

### **What Stayed**

- ✅ Facility details and inspector information
- ✅ Area-based inspection structure
- ✅ Photo upload functionality
- ✅ Comments and notes
- ✅ Digital signature capture
- ✅ PDF export capability

## 🤝 **Contributing**

1. Follow the established component structure
2. Use TypeScript for all new code
3. Maintain the positive, collaborative language
4. Ensure mobile-first responsive design
5. Test on multiple devices and screen sizes

## 📞 **Support**

For questions or support regarding the QA Checklist application, please contact the development team.

---

**Element Cleaning Systems** - Quality Assurance Made Simple
