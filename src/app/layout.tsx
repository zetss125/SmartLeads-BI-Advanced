import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartLeads BI - AI Lead Scoring & Marketing Assistant",
  description:
    "Transform raw social media engagement data into prioritized leads with AI-powered scoring and marketing strategy generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
