"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"

export interface AuthUser {
  id: number
  username: string
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF"
  shopCode?: string
  shopName?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (
    username: string,
    password: string,
    shopCode?: string
  ) => Promise<void>
  logout: () => void
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = "inv_user"

// Mock users for the prototype
const MOCK_USERS: AuthUser[] = [
  {
    id: 1,
    username: "admin",
    role: "ADMIN",
    shopCode: "BAKERY01",
    shopName: "Downtown Bakery",
  },
  {
    id: 2,
    username: "staff",
    role: "STAFF",
    shopCode: "BAKERY01",
    shopName: "Downtown Bakery",
  },
  {
    id: 3,
    username: "superadmin",
    role: "SUPER_ADMIN",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  })

  // Restore session on mount
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(USER_KEY)
      if (storedUser) {
        setState({
          token: "mock-token",
          user: JSON.parse(storedUser),
          isLoading: false,
        })
      } else {
        setState((s) => ({ ...s, isLoading: false }))
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback(
    async (username: string, _password: string, shopCode?: string) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Find matching mock user
      const matchedUser = MOCK_USERS.find((u) => {
        if (shopCode) {
          return (
            u.username.toLowerCase() === username.toLowerCase() &&
            u.shopCode === shopCode
          )
        }
        // Super admin login (no shopCode)
        return (
          u.username.toLowerCase() === username.toLowerCase() &&
          u.role === "SUPER_ADMIN"
        )
      })

      if (!matchedUser) {
        throw new Error(
          "Invalid credentials. Try admin/admin, staff/staff, or superadmin/superadmin."
        )
      }

      sessionStorage.setItem(USER_KEY, JSON.stringify(matchedUser))
      setState({ user: matchedUser, token: "mock-token", isLoading: false })
    },
    []
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(USER_KEY)
    setState({ user: null, token: null, isLoading: false })
  }, [])

  const isSuperAdmin = state.user?.role === "SUPER_ADMIN"

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
