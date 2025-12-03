import type React from "react"
import SupervisorLayoutClient from "./supervisor-layout-client"

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SupervisorLayoutClient>{children}</SupervisorLayoutClient>
}
