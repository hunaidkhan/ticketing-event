import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const poppins = Poppins({
   subsets: ["latin"],
   weight: ['400', '500', '600', '700'],
   variable: '--font-poppins'
   });

export const metadata: Metadata = {
  title: "Muslims Student Association (MSA)",
  description: "University of Alberta Event planning website | Allahu Akbar",
  icons: {
    icon: '/assets/images/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <ClerkProvider>
    <html lang="en">
      <body className={poppins.variable}>
        {children}
      
      </body>
    </html>
  </ClerkProvider>
  );
}
