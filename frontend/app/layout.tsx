import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import ClientErrorBoundary from "@/components/shared/ClientErrorBoundary";

export const metadata: Metadata = {
  title: "Advanced To-Do App | Organize Your Life with Style",
  description: "A modern, visually unique To-Do application with dynamic animations and a dark green theme. Built with Next.js 15.",
  keywords: ["todo", "task management", "productivity", "dark green theme", "animated UI"],
  authors: [{ name: "Advanced To-Do Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1a5c47", // Dark green primary color
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://advanced-todo-app.vercel.app",
    title: "Advanced To-Do App | Organize Your Life with Style",
    description: "A modern, visually unique To-Do application with dynamic animations and a dark green theme.",
    siteName: "Advanced To-Do App",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Advanced To-Do App - Dark green themed task management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced To-Do App | Organize Your Life with Style",
    description: "A modern, visually unique To-Do application with dynamic animations and a dark green theme.",
    images: ["/og-image.png"],
    creator: "@advanced_todo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
