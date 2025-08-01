import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import { cookies } from "next/headers";
import {ThemeProvider} from "@/components/theme-provider";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ServiceTracker Pro",
    description: "Professional service tracking application",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

    return (
        <html lang="en suppressHydrationWarning">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
        <ConditionalNavigation defaultOpen={defaultOpen}>

            {children}
        </ConditionalNavigation>
        </ThemeProvider>
        </body>
        </html>
    );
}