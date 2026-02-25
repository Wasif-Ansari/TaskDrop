import "./globals.css";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata = {
  title: "Clipper - Cross-Device To-Do & Clipper",
  description:
    "Capture tasks, links, images, and videos from mobile and manage them across all your devices. A smart PWA-powered clipboard.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030712",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="mesh-gradient min-h-screen">
        <ServiceWorkerRegistration />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
