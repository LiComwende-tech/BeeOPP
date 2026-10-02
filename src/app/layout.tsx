import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BeeOPP", template: "%s · BeeOPP" },
  description: "Show what you can do. Find what’s next.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
