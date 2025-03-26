import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/context/UserContext";
import "@/app/globals.css";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar"; // 移動 NavBar 成獨立 component（因為它是 client component）

export const metadata = {
  title: "Nebula",
  description: "A cosmo project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/ico" sizes="any" />
        <meta name="color-scheme" content="dark" suppressHydrationWarning />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider>
            <NavBar />
            <div className="pt-20">{children}</div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
