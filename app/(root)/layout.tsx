import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import type { Metadata } from "next";


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
    <div className="flex h-screen flex-col">
    <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
