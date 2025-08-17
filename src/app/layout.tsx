import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Sales State Machine",
  description: "AI-powered car sales assistant with state machine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}