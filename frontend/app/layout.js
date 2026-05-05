import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import DynamicTitle from "@/components/DynamicTitle";
import { GoogleAnalytics } from '@next/third-parties/google'; 

export const metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL('http://localhost:3000'),
    
  title: {
    default: `${process.env.NEXT_PUBLIC_NAME} | Villupuram`,
    template: `%s | ${process.env.NEXT_PUBLIC_NAME}`,
  },

  description:
    "Best boutique in Villupuram for bridal wear, blouse design, embroidery and custom stitching services.",

  keywords: [
    "boutique in Villupuram",
    "bridal blouse design",
    "custom stitching",
    "kaviya boutique",
    "kaviya boutique villupuram",
    "kaviya__boutique",
    "embroidery services",
  ],

  openGraph: {
    title: `${process.env.NEXT_PUBLIC_NAME}`,
    description:
      "Premium bridal and boutique services in Villupuram",

    url: "https://yourdomain.com",

    siteName: process.env.NEXT_PUBLIC_NAME,

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DynamicTitle />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </AuthProvider>
        {/* Add this line exactly here, before </body> */}
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}