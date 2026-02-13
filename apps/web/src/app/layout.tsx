import { Theme, Text, Box, Heading, Separator } from "@radix-ui/themes"
import Link from "next/link"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SBSK Notes",
  description: "Behandlingsverktøy for noteark",
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
    <html lang="no" suppressHydrationWarning>
      <body>
        <Theme accentColor="orange" grayColor="sand" radius="large" panelBackground="solid">
          <div className="app-layout">
            <nav className="sidebar">
              <Box mb="2">
                <Heading size="4" color="orange">
                  SBSK Notes
                </Heading>
                <Text size="1" color="gray">
                  Notearkbehandling
                </Text>
              </Box>
              <Separator size="4" mb="2" />
              <SidebarLink href="/upload">Last opp</SidebarLink>
              <SidebarLink href="/processing">Behandling</SidebarLink>
              <SidebarLink href="/validation">Validering</SidebarLink>
            </nav>
            <main className="main-content">{children}</main>
          </div>
        </Theme>
      </body>
    </html>
  )
}
