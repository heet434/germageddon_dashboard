"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WormIcon as Virus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Virus className="h-6 w-6" />
            <span className="font-bold">Pandemic Dashboard</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-between">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Globe Visualization
            </Link>
            <Link
              href="/infographics"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/infographics" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Infographics
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

