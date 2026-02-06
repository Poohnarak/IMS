"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Shield, User as UserIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { mockShopUsers, type ShopUser } from "@/lib/mock-data"

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<ShopUser[]>(mockShopUsers)

  // Create user form
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("STAFF")
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/")
    }
  }, [user, router])

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")

    if (users.some((u) => u.username === newUsername)) {
      setCreateError("Username already exists.")
      return
    }

    const newUser: ShopUser = {
      id: Date.now(),
      username: newUsername,
      role: newRole as "ADMIN" | "STAFF",
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    setNewUsername("")
    setNewPassword("")
    setNewRole("STAFF")
  }

  function handleDeleteUser(userId: number) {
    setUsers(users.filter((u) => u.id !== userId))
  }

  if (user?.role !== "ADMIN") return null

  return (
    <div>
      <PageHeader
        title="User Management"
        description={`Manage users for ${user.shopName || "your shop"}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New User</CardTitle>
            <CardDescription>
              Add a new user to your shop. They will be able to access the
              inventory system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-role">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger id="new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createError && (
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {createError}
                </div>
              )}

              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shop Users</CardTitle>
            <CardDescription>
              {users.length} user{users.length !== 1 ? "s" : ""} in your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {u.role === "ADMIN" ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {u.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={u.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {u.role}
                    </Badge>
                    {u.username !== user.username && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">
                              Delete {u.username}
                            </span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the user
                              &quot;{u.username}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
