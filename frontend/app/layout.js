export const metadata = {
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
    "embroidery services",
    "fashion designer Villupuram",
  ],

  openGraph: {
    title: `${process.env.NEXT_PUBLIC_NAME}`,
    description:
      "Premium bridal and boutique services in Villupuram",
    url: "https://yourdomain.com",
    siteName: `${process.env.NEXT_PUBLIC_NAME}`,
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