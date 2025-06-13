"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JanitorialChecklist() {
  const [formData, setFormData] = useState({
    centerNumber: "",
    centerDirector: "",
    franchisee: "",
    daysCleanedWeek: "",
    overallInspectionScore: "",
    inspectedBy: "",
    dateOfInspection: "",
    comments: "",
    centerDirectorSignature: "",
    franchiseeSignature: "",
    date: "",
  })

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: checked }))
  }

  const checklistSections = [
    {
      title: "Security",
      items: [
        "Entrances",
        "Emergency exits",
        "Doors locked",
        "Lights off",
        "Hard surface floors",
        "Carpets/rugs",
        "Trash/Recycle",
        "Glass/Mirrors",
        "Dusting",
        "Vacuum stairs",
      ],
    },
    {
      title: "Restrooms",
      items: ["Toilets", "Urinals", "Sinks", "Mirrors", "Dispensers", "Trash", "Mopping", "Supplies", "Odor"],
    },
    {
      title: "Kitchen",
      items: [
        "Refrigerator",
        "Microwave",
        "Coffee area",
        "Sink",
        "Counters",
        "Cabinets/drawers",
        "Floor",
        "Trash",
        "Dishwasher/sink",
        "Tables",
      ],
    },
    {
      title: "General Areas",
      items: [
        "Dusting/wiping",
        "Vacuuming",
        "Hard surface floors",
        "Carpets",
        "Trash",
        "Glass",
        "Workstations",
        "Conference rooms",
        "Break rooms",
        "Reception",
      ],
    },
  ]

  const additionalItems = ["Stairwells", "Elevators", "Hallways", "Storage areas", "Restocking supplies"]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-center">HOUSEKEEPING INSPECTION REPORT</h1>
        </div>
        <div className="bg-blue-900 text-white px-4 py-2 text-sm font-bold">
          JAN-PRO
          <br />
          CLEANING SYSTEMS
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="w-32 text-sm font-medium">Center Number:</Label>
            <Input
              value={formData.centerNumber}
              onChange={(e) => handleInputChange("centerNumber", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-32 text-sm font-medium">Center Director:</Label>
            <Input
              value={formData.centerDirector}
              onChange={(e) => handleInputChange("centerDirector", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-32 text-sm font-medium">Franchisee:</Label>
            <Input
              value={formData.franchisee}
              onChange={(e) => handleInputChange("franchisee", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-32 text-sm font-medium"># Days Cleaned:</Label>
            <Input
              value={formData.daysCleanedWeek}
              onChange={(e) => handleInputChange("daysCleanedWeek", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="w-40 text-sm font-medium">Overall Inspection Score:</Label>
            <Input
              value={formData.overallInspectionScore}
              onChange={(e) => handleInputChange("overallInspectionScore", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-40 text-sm font-medium">Inspected By:</Label>
            <Input
              value={formData.inspectedBy}
              onChange={(e) => handleInputChange("inspectedBy", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-40 text-sm font-medium">Date of Inspection:</Label>
            <Input
              type="date"
              value={formData.dateOfInspection}
              onChange={(e) => handleInputChange("dateOfInspection", e.target.value)}
              className="flex-1 border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            />
          </div>
        </div>
      </div>

      {/* Checklist Header */}
      <div className="bg-gray-800 text-white p-2 mb-4">
        <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium">
          <div>Security</div>
          <div>Service Improvement</div>
          <div>Satisfactory</div>
          <div>Unsatisfactory</div>
        </div>
      </div>

      {/* Main Checklist */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {checklistSections.map((section, sectionIndex) => (
          <div key={section.title} className="space-y-2">
            <h3 className="font-bold text-sm mb-3">{section.title}</h3>
            {section.items.map((item, itemIndex) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`${section.title}-${item}`}
                  checked={checkedItems[`${section.title}-${item}`] || false}
                  onCheckedChange={(checked) => handleCheckboxChange(`${section.title}-${item}`, checked as boolean)}
                />
                <Label htmlFor={`${section.title}-${item}`} className="text-xs">
                  {item}
                </Label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Additional Items */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-3">Additional Items</h3>
        <div className="grid grid-cols-3 gap-4">
          {additionalItems.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item}
                checked={checkedItems[item] || false}
                onCheckedChange={(checked) => handleCheckboxChange(item, checked as boolean)}
              />
              <Label htmlFor={item} className="text-xs">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="mb-6">
        <Label className="text-sm font-medium">Quality Assessment:</Label>
        <div className="mt-2 text-xs">Provide details and directions for any and existing discrepancies</div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="satisfactory" />
            <Label htmlFor="satisfactory" className="text-sm">
              Satisfactory
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="unsatisfactory" />
            <Label htmlFor="unsatisfactory" className="text-sm">
              Unsatisfactory
            </Label>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-6">
        <Label className="text-sm font-medium">Comments/Recommendations/Notes:</Label>
        <Textarea
          value={formData.comments}
          onChange={(e) => handleInputChange("comments", e.target.value)}
          className="mt-2 min-h-[100px]"
          placeholder="Enter any additional comments or recommendations..."
        />
      </div>

      {/* Reminder Section */}
      <Card className="mb-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm font-bold">REMINDER</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs">
            <strong>ENCOURAGE AND TEACH THE MANY BENEFITS OF NEUTRAL FLOOR CLEANERS</strong>
          </p>
          <p className="text-xs mt-2">
            Maintaining cleaner can be diluted 1:64, 1:32, 1:16, and 1:8 for light, medium, heavy, and extra heavy soil
            conditions respectively.
          </p>
          <p className="text-xs mt-2 text-red-600">
            <em>Contracting for proper safety and dilute required for the customer</em>
          </p>
        </CardContent>
      </Card>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Center Director:</Label>
          <Input
            value={formData.centerDirectorSignature}
            onChange={(e) => handleInputChange("centerDirectorSignature", e.target.value)}
            className="border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            placeholder="Signature"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date:</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Franchisee:</Label>
          <Input
            value={formData.franchiseeSignature}
            onChange={(e) => handleInputChange("franchiseeSignature", e.target.value)}
            className="border-b border-black rounded-none border-t-0 border-l-0 border-r-0"
            placeholder="Signature"
          />
        </div>
        <div></div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2">Submit Inspection Report</Button>
      </div>
    </div>
  )
}
