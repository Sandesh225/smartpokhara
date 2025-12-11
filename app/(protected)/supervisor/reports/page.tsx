"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Badge } from "@/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Checkbox } from "@/ui/checkbox";
import {
  FileText,
  Download,
  CalendarIcon,
  BarChart3,
  Users,
  MapPin,
  Clock,
  Filter,
  FileSpreadsheet,
  FilePen as FilePdf,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCategories, useWards, useDepartments } from "@/lib/hooks/use-complaints"
import { useToast } from "@/hooks/use-toast"

type ReportType = "summary" | "detailed" | "staff" | "ward" | "category" | "timeline"

interface ReportConfig {
  type: ReportType
  dateFrom: Date | undefined
  dateTo: Date | undefined
  categories: string[]
  wards: string[]
  departments: string[]
  includeResolved: boolean
  includePending: boolean
  includeRejected: boolean
  format: "pdf" | "excel" | "csv"
}

const reportTypes = [
  { id: "summary", name: "Summary Report", icon: BarChart3, description: "Overview of complaint statistics" },
  { id: "detailed", name: "Detailed Report", icon: FileText, description: "Full complaint details with history" },
  { id: "staff", name: "Staff Performance", icon: Users, description: "Staff workload and resolution metrics" },
  { id: "ward", name: "Ward Analysis", icon: MapPin, description: "Complaints by ward with trends" },
  { id: "category", name: "Category Breakdown", icon: Filter, description: "Analysis by complaint categories" },
  { id: "timeline", name: "Timeline Report", icon: Clock, description: "Complaint trends over time" },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const { categories } = useCategories()
  const { wards } = useWards()
  const { departments } = useDepartments()

  const [config, setConfig] = useState<ReportConfig>({
    type: "summary",
    dateFrom: undefined,
    dateTo: undefined,
    categories: [],
    wards: [],
    departments: [],
    includeResolved: true,
    includePending: true,
    includeRejected: false,
    format: "pdf",
  })

  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGenerating(false)
    toast({
      title: "Report Generated",
      description: `Your ${config.type} report has been generated successfully.`,
    })
  }

  const selectedReportType = reportTypes.find((r) => r.id === config.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download comprehensive reports</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Type</CardTitle>
              <CardDescription>Select the type of report to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((report) => {
                const Icon = report.icon
                return (
                  <button
                    key={report.id}
                    onClick={() => setConfig((c) => ({ ...c, type: report.id as ReportType }))}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      config.type === report.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 mt-0.5",
                        config.type === report.id ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-muted-foreground">{report.description}</div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Report</CardTitle>
              <CardDescription>Customize your {selectedReportType?.name.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !config.dateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.dateFrom ? format(config.dateFrom, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.dateFrom}
                        onSelect={(date) => setConfig((c) => ({ ...c, dateFrom: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !config.dateTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.dateTo ? format(config.dateTo, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.dateTo}
                        onSelect={(date) => setConfig((c) => ({ ...c, dateTo: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filters */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wards</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All wards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Inclusion */}
              <div className="space-y-3">
                <Label>Include Status</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-pending"
                      checked={config.includePending}
                      onCheckedChange={(checked) => setConfig((c) => ({ ...c, includePending: checked as boolean }))}
                    />
                    <label htmlFor="include-pending" className="text-sm">
                      Pending
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-resolved"
                      checked={config.includeResolved}
                      onCheckedChange={(checked) => setConfig((c) => ({ ...c, includeResolved: checked as boolean }))}
                    />
                    <label htmlFor="include-resolved" className="text-sm">
                      Resolved
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-rejected"
                      checked={config.includeRejected}
                      onCheckedChange={(checked) => setConfig((c) => ({ ...c, includeRejected: checked as boolean }))}
                    />
                    <label htmlFor="include-rejected" className="text-sm">
                      Rejected
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="flex gap-2">
                  <Button
                    variant={config.format === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig((c) => ({ ...c, format: "pdf" }))}
                  >
                    <FilePdf className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    variant={config.format === "excel" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig((c) => ({ ...c, format: "excel" }))}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant={config.format === "csv" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig((c) => ({ ...c, format: "csv" }))}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedReportType?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.dateFrom && config.dateTo
                      ? `${format(config.dateFrom, "MMM d, yyyy")} - ${format(config.dateTo, "MMM d, yyyy")}`
                      : "All time"}
                    {" | "}
                    {config.format.toUpperCase()} format
                  </p>
                </div>
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Monthly Summary - November 2024", date: "Dec 1, 2024", format: "PDF" },
                  { name: "Staff Performance Q4", date: "Nov 28, 2024", format: "Excel" },
                  { name: "Ward Analysis - Ward 5", date: "Nov 25, 2024", format: "PDF" },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{report.name}</div>
                        <div className="text-xs text-muted-foreground">{report.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{report.format}</Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
