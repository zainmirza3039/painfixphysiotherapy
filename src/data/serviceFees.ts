export const SERVICE_FEES = {
  clinic: {
    name: "In-clinic fee",
    amount: 2000,
    displayPrice: "PKR 2,000",
    currency: "PKR",
    description: "Fee for an in-clinic appointment.",
  },
  homeVisit: {
    name: "Home visit fee",
    amount: 2500,
    displayPrice: "PKR 2,500",
    currency: "PKR",
    description: "Includes one treatment session and travel.",
  },
  video: {
    name: "Video consultation",
    amount: 1000,
    displayPrice: "PKR 1,000",
    currency: "PKR",
    description: "Fee for a video consultation.",
  },
} as const;
