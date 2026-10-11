import { JetBrains_Mono, Schibsted_Grotesk, Unbounded } from "next/font/google";
import Nav from "./Nav";
import "./globals.css";

const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = { title: "Python Coding Clock", description: "Four timed Python questions, one for each quarter of the clock." };
export const viewport = { themeColor: "#0b2238" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${schibsted.variable} ${mono.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
