import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "MiniAMM DeFi App",
  description: "Swap tokens and manage liquidity on MiniAMM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Providers>
          <Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
