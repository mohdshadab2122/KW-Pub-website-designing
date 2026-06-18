import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KW Publishers | Defence, Diplomacy & Strategic Studies Publications",
  description:
    "Explore books, journals, monographs, and policy-focused publications from KW Publishers, India's specialist publisher for defence, diplomacy, geopolitics, military history, and strategic studies.",
  icons: {
    icon: "/assets/favicon.svg",
    shortcut: "/assets/favicon.svg",
  },
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
