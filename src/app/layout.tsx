import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Djabon Ounimborbitibou · Quantum Information Researcher",
  description: "Academic portfolio of Djabon Ounimborbitibou, MSc Mathematical Sciences (Distinction, AIMS Ghana). Research in quantum information theory, quantum chemistry, and quantum-assisted machine learning. Seeking PhD positions in quantum communication, computing, and information.",
  keywords: ["quantum information", "quantum communication", "Qiskit", "PennyLane", "quantum computing", "decoupling", "quantum chemistry", "VSC", "QML", "PhD", "Djabon", "Ounimborbitibou", "AIMS Ghana"],
  authors: [{ name: "Djabon Ounimborbitibou" }],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Djabon Ounimborbitibou · Quantum Information Researcher",
    description: "Academic portfolio. MSc Mathematical Sciences (Distinction, AIMS Ghana). Seeking PhD positions in quantum information, computing, and communication.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${garamond.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
