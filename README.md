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
├── qa-checklist.tsx          # Main QA form component
├── qa-report.tsx             # Report generation and display
├── mobile-janitorial-checklist.tsx  # Legacy component (kept for reference)
└── ui/                       # Reusable UI components
```

### **Key Technologies**

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

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
