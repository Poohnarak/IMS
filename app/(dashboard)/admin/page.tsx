"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { platformOverview } from "@/lib/mock-data"

export default function SuperAdminOverviewPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.replace("/")
    }
  }, [user, router])

  if (user?.role !== "SUPER_ADMIN") return null

  const stats = [
    {
      label: "Total Shops",
      value: platformOverview.totalShops,
      icon: Building2,
      description: "Registered on the platform",
    },
    {
      label: "Active Shops",
      value: platformOverview.activeShops,
      icon: Activity,
      description: "Currently operational",
    },
    {
      label: "Disabled Shops",
      value: platformOverview.disabledShops,
      icon: ShieldAlert,
      description: "Temporarily suspended",
    },
    {
      label: "Super Admins",
      value: platformOverview.totalSuperAdmins,
      icon: Users,
      description: "Platform administrators",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide metrics and shop health at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
