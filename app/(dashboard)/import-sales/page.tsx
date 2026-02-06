"use client"

import { useState } from "react"
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Store,
  Bike,
  Monitor,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockProducts } from "@/lib/mock-data"

type SalesSource = "grab" | "lineman" | "pos"

interface CSVRow {
  id: string
  orderId: string
  productName: string
  quantity: number
  unitPrice: number
  date: string
  mappedProductId: string
}

const sourceConfig: Record<
  SalesSource,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  grab: {
    label: "Grab",
    icon: Bike,
    color: "bg-emerald-500/10 text-emerald-600",
    description: "Import sales data from GrabFood orders",
  },
  lineman: {
    label: "Lineman",
    icon: Store,
    color: "bg-lime-500/10 text-lime-700",
    description: "Import sales data from LINE MAN orders",
  },
  pos: {
    label: "POS",
    icon: Monitor,
    color: "bg-sky-500/10 text-sky-600",
    description: "Import sales data from your Point of Sale system",
  },
}

const mockCSVBySource: Record<SalesSource, CSVRow[]> = {
  grab: [
    { id: "1", orderId: "GRB-20260205-001", productName: "Chocolate Cake", quantity: 2, unitPrice: 25.0, date: "2026-02-05", mappedProductId: "" },
    { id: "2", orderId: "GRB-20260205-002", productName: "Vanilla Cupcakes x12", quantity: 1, unitPrice: 18.0, date: "2026-02-05", mappedProductId: "" },
    { id: "3", orderId: "GRB-20260205-003", productName: "Croissant", quantity: 5, unitPrice: 4.5, date: "2026-02-05", mappedProductId: "" },
    { id: "4", orderId: "GRB-20260204-001", productName: "Cream Puffs Set", quantity: 3, unitPrice: 15.0, date: "2026-02-04", mappedProductId: "" },
  ],
  lineman: [
    { id: "1", orderId: "LM-00451", productName: "Choco Cake Large", quantity: 1, unitPrice: 25.0, date: "2026-02-05", mappedProductId: "" },
    { id: "2", orderId: "LM-00452", productName: "Butter Cookie Box", quantity: 4, unitPrice: 12.0, date: "2026-02-05", mappedProductId: "" },
    { id: "3", orderId: "LM-00453", productName: "Fresh Croissant", quantity: 10, unitPrice: 4.5, date: "2026-02-04", mappedProductId: "" },
  ],
  pos: [
    { id: "1", orderId: "POS-0891", productName: "Chocolate Cake", quantity: 3, unitPrice: 25.0, date: "2026-02-05", mappedProductId: "" },
    { id: "2", orderId: "POS-0892", productName: "Vanilla Cupcakes (12pcs)", quantity: 2, unitPrice: 18.0, date: "2026-02-05", mappedProductId: "" },
    { id: "3", orderId: "POS-0893", productName: "Butter Cookies (20pcs)", quantity: 6, unitPrice: 12.0, date: "2026-02-05", mappedProductId: "" },
    { id: "4", orderId: "POS-0894", productName: "Croissant", quantity: 15, unitPrice: 4.5, date: "2026-02-05", mappedProductId: "" },
    { id: "5", orderId: "POS-0895", productName: "Cream Puffs (6pcs)", quantity: 4, unitPrice: 15.0, date: "2026-02-04", mappedProductId: "" },
  ],
}

export default function ImportSalesPage() {
  const [selectedSource, setSelectedSource] = useState<SalesSource | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleSelectSource = (source: SalesSource) => {
    setSelectedSource(source)
    setUploadedFile(null)
    setCsvData([])
    setImportSuccess(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (
      file.type === "text/csv" ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx")
    ) {
      setIsUploading(true)
      setUploadedFile(file)
      setTimeout(() => {
        setCsvData(mockCSVBySource[selectedSource!])
        setIsUploading(false)
      }, 1000)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setCsvData([])
    setImportSuccess(false)
  }

  const handleProductMapping = (rowId: string, productId: string) => {
    setCsvData(
      csvData.map((row) =>
        row.id === rowId ? { ...row, mappedProductId: productId } : row
      )
    )
  }

  const handleAutoMap = () => {
    setCsvData(
      csvData.map((row, i) => ({
        ...row,
        mappedProductId:
          mockProducts[i % mockProducts.length]?.id || mockProducts[0]?.id || "",
      }))
    )
  }

  const handleImport = () => {
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImportSuccess(true)
    }, 1500)
  }

  const handleStartOver = () => {
    setSelectedSource(null)
    setUploadedFile(null)
    setCsvData([])
    setImportSuccess(false)
  }

  const allMapped =
    csvData.length > 0 && csvData.every((row) => row.mappedProductId)
  const totalRevenue = csvData.reduce(
    (sum, row) => sum + row.quantity * row.unitPrice,
    0
  )
  const totalItems = csvData.reduce((sum, row) => sum + row.quantity, 0)

  return (
    <div>
      <PageHeader
        title="Import Sales"
        description="Upload sales data from delivery platforms or POS systems"
      />

      {/* Step 1: Select Source */}
      {!selectedSource && (
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.entries(sourceConfig) as [SalesSource, typeof sourceConfig.grab][]).map(
            ([key, config]) => (
              <Card
                key={key}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
                onClick={() => handleSelectSource(key)}
              >
                <CardContent className="flex flex-col items-center gap-3 pt-6 pb-6">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${config.color}`}
                  >
                    <config.icon className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">
                      {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {selectedSource && !uploadedFile && !importSuccess && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={handleStartOver}>
              Back
            </Button>
            <Badge
              variant="outline"
              className={sourceConfig[selectedSource].color}
            >
              {sourceConfig[selectedSource].label}
            </Badge>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drop your {sourceConfig[selectedSource].label} sales file
                    here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports CSV and XLSX files
                  </p>
                  <Button type="button" variant="outline">
                    Select File
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">
              {sourceConfig[selectedSource].label} CSV Format
            </h3>
            <ul className="text-sm text-muted-foreground flex flex-col gap-1">
              <li>
                Required columns: order_id, product_name, quantity, unit_price,
                date
              </li>
              <li>Date format: YYYY-MM-DD</li>
              <li>
                Export the file from your {sourceConfig[selectedSource].label}{" "}
                merchant dashboard
              </li>
            </ul>
          </div>
        </>
      )}

      {/* Loading State */}
      {isUploading && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              <p className="text-muted-foreground">
                Parsing {sourceConfig[selectedSource!].label} sales file...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {importSuccess && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={sourceConfig[selectedSource!].color}
            >
              {sourceConfig[selectedSource!].label}
            </Badge>
          </div>

          <Alert className="border-emerald-200 bg-emerald-50/50">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              Successfully imported {csvData.length} orders ({totalItems} items)
              totaling ${totalRevenue.toFixed(2)} from{" "}
              {sourceConfig[selectedSource!].label}.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button onClick={handleStartOver} variant="outline" size="lg">
              Import Another File
            </Button>
          </div>
        </div>
      )}

      {/* Uploaded File Info + Preview Table */}
      {uploadedFile && !isUploading && !importSuccess && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={handleStartOver}>
              Back
            </Button>
            <Badge
              variant="outline"
              className={sourceConfig[selectedSource!].color}
            >
              {sourceConfig[selectedSource!].label}
            </Badge>
          </div>

          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-base">
                      {uploadedFile.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB |{" "}
                      {csvData.length} orders | {totalItems} items | $
                      {totalRevenue.toFixed(2)} total
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Preview Table */}
          {csvData.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Preview & Map Products
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoMap}
                    disabled={allMapped}
                  >
                    Auto-Map All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Map to Product</TableHead>
                          <TableHead className="w-12">
                            <span className="sr-only">Status</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-mono text-xs">
                              {row.orderId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.date}
                            </TableCell>
                            <TableCell className="font-medium">
                              {row.productName}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              ${row.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${(row.quantity * row.unitPrice).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={row.mappedProductId}
                                onValueChange={(value) =>
                                  handleProductMapping(row.id, value)
                                }
                              >
                                <SelectTrigger className="w-44">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockProducts.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {row.mappedProductId ? (
                                <Check className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Button */}
          {csvData.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={!allMapped || isImporting}
                className="gap-2"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm Import ({csvData.length} orders)
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
