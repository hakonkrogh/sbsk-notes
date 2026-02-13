import { Theme, Text, Box } from "@radix-ui/themes"
import Link from "next/link"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SBSK Notes",
  description: "Sheet music ingestion pipeline",
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Box py="2" px="3" asChild>
      <Link href={href}>
        <Text size="3" weight="medium">
          {children}
        </Text>
      </Link>
    </Box>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Theme accentColor="blue" radius="medium">
          <nav className="sidebar">
            <Box mb="4">
              <Text size="5" weight="bold">
                SBSK Notes
              </Text>
            </Box>
            <SidebarLink href="/upload">Upload</SidebarLink>
            <SidebarLink href="/processing">Processing</SidebarLink>
            <SidebarLink href="/validation">Validation</SidebarLink>
          </nav>
          <main className="main-content">{children}</main>
        </Theme>
      </body>
    </html>
  )
}
