import type React from "react"
import SidebarDashboard from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <SidebarDashboard />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
