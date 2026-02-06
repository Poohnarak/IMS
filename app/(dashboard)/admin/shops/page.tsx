"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Power,
  PowerOff,
  KeyRound,
  Trash2,
  BarChart3,
  Users,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { mockShops, type Shop } from "@/lib/mock-data"

export default function ShopManagementPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [shops, setShops] = useState<Shop[]>(mockShops)
  const [searchQuery, setSearchQuery] = useState("")

  // Create shop dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    shopCode: "",
    shopName: "",
    adminUsername: "admin",
    adminPassword: "admin123",
  })
  const [createError, setCreateError] = useState("")

  // Stats dialog
  const [statsShop, setStatsShop] = useState<Shop | null>(null)

  // Reset admin dialog
  const [resetShop, setResetShop] = useState<Shop | null>(null)
  const [resetForm, setResetForm] = useState({
    username: "admin",
    password: "admin123",
  })

  // Delete confirm
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null)

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.replace("/")
    }
  }, [user, router])

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops
    const q = searchQuery.toLowerCase()
    return shops.filter(
      (s) =>
        s.shopCode.toLowerCase().includes(q) ||
        s.shopName.toLowerCase().includes(q)
    )
  }, [shops, searchQuery])

  function handleCreateShop(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")

    if (shops.some((s) => s.shopCode === createForm.shopCode)) {
      setCreateError("A shop with this code already exists.")
      return
    }

    const newShop: Shop = {
      id: Date.now(),
      shopCode: createForm.shopCode,
      shopName: createForm.shopName,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    setShops([...shops, newShop])
    setIsCreateOpen(false)
    setCreateForm({
      shopCode: "",
      shopName: "",
      adminUsername: "admin",
      adminPassword: "admin123",
    })
  }

  function handleToggleShop(shop: Shop) {
    setShops(
      shops.map((s) =>
        s.id === shop.id ? { ...s, isActive: !s.isActive } : s
      )
    )
  }

  function handleDeleteShop() {
    if (!deleteShop) return
    setShops(shops.filter((s) => s.id !== deleteShop.id))
    setDeleteShop(null)
  }

  function handleResetAdmin(e: React.FormEvent) {
    e.preventDefault()
    // In prototype mode, just close the dialog
    setResetShop(null)
    setResetForm({ username: "admin", password: "admin123" })
  }

  if (user?.role !== "SUPER_ADMIN") return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            Shop Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, configure, and monitor tenant shops.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shop</DialogTitle>
              <DialogDescription>
                This will create the shop record, provision two databases (users
                + app), run migrations, and seed a default admin user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateShop} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="shopCode">Shop Code</Label>
                <Input
                  id="shopCode"
                  placeholder="e.g. BAKERY01"
                  value={createForm.shopCode}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      shopCode: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Alphanumeric, uppercase. Used as the login identifier.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="e.g. Downtown Bakery"
                  value={createForm.shopName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, shopName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminUser">Admin Username</Label>
                  <Input
                    id="adminUser"
                    value={createForm.adminUsername}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        adminUsername: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminPass">Admin Password</Label>
                  <Input
                    id="adminPass"
                    type="password"
                    value={createForm.adminPassword}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        adminPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {createError && (
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {createError}
                </div>
              )}

              <DialogFooter>
                <Button type="submit">Create & Provision</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search shops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Shops Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registered Shops</CardTitle>
          <CardDescription>
            {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""}{" "}
            total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredShops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No shops match your search."
                  : "No shops found. Create your first shop above."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Code</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {shop.shopCode}
                      </TableCell>
                      <TableCell>{shop.shopName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={shop.isActive ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {shop.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setStatsShop(shop)}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleShop(shop)}
                            >
                              {shop.isActive ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setResetShop(shop)}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteShop(shop)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Dialog */}
      <Dialog
        open={!!statsShop}
        onOpenChange={(open) => !open && setStatsShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statsShop?.shopName} ({statsShop?.shopCode})
            </DialogTitle>
            <DialogDescription>
              Usage statistics for this shop (prototype data).
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" />
                Users
              </div>
              <div className="text-lg font-semibold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">2 active</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">Products</div>
              <div className="text-lg font-semibold text-foreground">5</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Ingredients
              </div>
              <div className="text-lg font-semibold text-foreground">10</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Sales Records
              </div>
              <div className="text-lg font-semibold text-foreground">128</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Admin Dialog */}
      <Dialog
        open={!!resetShop}
        onOpenChange={(open) => !open && setResetShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Admin - {resetShop?.shopName}</DialogTitle>
            <DialogDescription>
              Reset or create the admin user for this shop.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetAdmin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reset-username">Admin Username</Label>
              <Input
                id="reset-username"
                value={resetForm.username}
                onChange={(e) =>
                  setResetForm((p) => ({ ...p, username: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="submit">Reset Admin</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteShop}
        onOpenChange={(open) => !open && setDeleteShop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteShop?.shopName}</span> (
              {deleteShop?.shopCode})? This will remove the shop and all
              associated databases. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShop}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
