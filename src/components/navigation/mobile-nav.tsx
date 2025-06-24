'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, Tag, TrendingUp, Plus } from "lucide-react"

import { cn } from "@/shared/utils/cn"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/wallets",
    label: "Carteiras",
    icon: Wallet,
  },
  {
    href: "/categories",
    label: "Categorias", 
    icon: Tag,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: TrendingUp,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Floating Action Button */}
        <Button
          asChild
          size="icon"
          className="absolute -top-6 right-4 h-12 w-12 rounded-full shadow-lg"
        >
          <Link href="/transactions/new">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Nova transação</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
} 