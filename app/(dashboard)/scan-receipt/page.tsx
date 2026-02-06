"use client"

import { useState } from "react"
import {
  Camera,
  Upload,
  X,
  Check,
  Trash2,
  Plus,
  ImageIcon,
  PenLine,
  ScanLine,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { mockIngredients, type ReceiptItem } from "@/lib/mock-data"

type ReceiptMode = "manual" | "scan"

const scanReceiptItems: ReceiptItem[] = [
  { id: "1", rawItemName: "FLOUR 25KG BAG", ingredientId: "", quantity: 25, price: 62.5 },
  { id: "2", rawItemName: "SUGAR WHITE 10KG", ingredientId: "", quantity: 10, price: 30.0 },
  { id: "3", rawItemName: "BUTTER UNSALTED 5KG", ingredientId: "", quantity: 5, price: 40.0 },
]

export default function ReceiptPage() {
  const [mode, setMode] = useState<ReceiptMode | null>(null)
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectMode = (selected: ReceiptMode) => {
    setMode(selected)
    setReceiptItems([])
    setConfirmSuccess(false)
    setUploadedImage(null)
    if (selected === "manual") {
      setReceiptItems([{ id: Date.now().toString(), rawItemName: "", ingredientId: "", quantity: 0, price: 0 }])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files[0]) handleFileSelect(files[0])
  }

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string)
        processReceipt()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) handleFileSelect(files[0])
  }

  const processReceipt = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setReceiptItems(scanReceiptItems)
      setIsProcessing(false)
    }, 2000)
  }

  const handleUpdateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setReceiptItems(receiptItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleDeleteItem = (id: string) => {
    setReceiptItems(receiptItems.filter((item) => item.id !== id))
  }

  const handleAddItem = () => {
    setReceiptItems([...receiptItems, { id: Date.now().toString(), rawItemName: "", ingredientId: "", quantity: 0, price: 0 }])
  }

  const handleConfirm = () => {
    setIsConfirming(true)
    setTimeout(() => {
      setIsConfirming(false)
      setConfirmSuccess(true)
    }, 1500)
  }

  const handleStartOver = () => {
    setMode(null)
    setReceiptItems([])
    setUploadedImage(null)
    setConfirmSuccess(false)
  }

  const allItemsMapped = receiptItems.length > 0 && receiptItems.every((item) => item.ingredientId)
  const totalAmount = receiptItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Receipt" description="Record ingredient purchases from supplier receipts" />

      {/* Step 1: Choose Mode -- no card borders */}
      {!mode && !confirmSuccess && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-6 transition-all hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => handleSelectMode("manual")}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <PenLine className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Manual Entry</p>
              <p className="text-xs text-muted-foreground mt-1">Type in receipt items by hand</p>
            </div>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-6 transition-all hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => handleSelectMode("scan")}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <ScanLine className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Scan Receipt</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a photo to extract items</p>
            </div>
          </button>
        </div>
      )}

      {/* Success */}
      {confirmSuccess && (
        <div className="flex flex-col gap-6">
          <Alert className="border-emerald-200 bg-emerald-50/50">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              Receipt processed successfully! {receiptItems.length} items totaling ${totalAmount.toFixed(2)} have been recorded.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={handleStartOver} variant="outline" size="lg">Record Another Receipt</Button>
          </div>
        </div>
      )}

      {/* Back + Mode Badge */}
      {mode && !confirmSuccess && (
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={handleStartOver}>Back</Button>
          <Badge variant="secondary" className={mode === "manual" ? "bg-amber-500/10 text-amber-600" : "bg-violet-500/10 text-violet-600"}>
            {mode === "manual" ? "Manual Entry" : "Scan Receipt"}
          </Badge>
        </div>
      )}

      {/* Scan: Upload Area */}
      {mode === "scan" && !uploadedImage && !isProcessing && !confirmSuccess && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div onDragOver={handleDragOver} onDrop={handleDrop} className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input type="file" accept="image/*" capture="environment" onChange={handleFileInputChange} className="hidden" id="receipt-upload" />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Take a photo or upload receipt</p>
                <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, HEIC</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button type="button" className="gap-2"><Camera className="h-4 w-4" />Take Photo</Button>
                  <Button type="button" variant="outline" className="gap-2 bg-transparent"><Upload className="h-4 w-4" />Upload Image</Button>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan: Processing */}
      {isProcessing && (
        <Card className="mb-6">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
              <p className="text-lg font-medium mb-1">Processing Receipt</p>
              <p className="text-sm text-muted-foreground">Extracting items from image...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan: Image Preview */}
      {mode === "scan" && uploadedImage && !isProcessing && !confirmSuccess && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Receipt Image</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setUploadedImage(null); setReceiptItems([]) }} className="text-muted-foreground hover:text-destructive">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] max-h-64 w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadedImage} alt="Uploaded receipt" className="h-full w-full object-contain" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shared: Editable Items */}
      {mode && receiptItems.length > 0 && !isProcessing && !confirmSuccess && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{mode === "manual" ? "Receipt Items" : "Review Extracted Items"}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2 bg-transparent"><Plus className="h-4 w-4" />Add Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {receiptItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-muted/30 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Item Name</label>
                    <Input value={item.rawItemName} onChange={(e) => handleUpdateItem(item.id, "rawItemName", e.target.value)} placeholder="e.g. Flour 25kg bag" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Map to Ingredient</label>
                    <Select value={item.ingredientId} onValueChange={(value) => handleUpdateItem(item.id, "ingredientId", value)}>
                      <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                      <SelectContent>
                        {mockIngredients.map((ing) => (<SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                      <Input type="number" value={item.quantity || ""} onChange={(e) => handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} placeholder="0" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">Price ($)</label>
                      <Input type="number" step="0.01" value={item.price || ""} onChange={(e) => handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="font-medium">Total Amount</span>
              <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      {mode && receiptItems.length > 0 && !isProcessing && !confirmSuccess && (
        <div className="flex justify-end">
          <Button onClick={handleConfirm} disabled={!allItemsMapped || isConfirming} className="gap-2" size="lg">
            {isConfirming ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />Processing...</>) : (<><Check className="h-4 w-4" />Confirm Receipt ({receiptItems.length} items)</>)}
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!mode && !confirmSuccess && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground flex flex-col gap-1">
            <li><strong>Manual Entry</strong> - Type in each item from your receipt by hand. Best for short receipts.</li>
            <li><strong>Scan Receipt</strong> - Upload a photo and the system will extract items automatically. Review and correct before confirming.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
