import '@ant-design/v5-patch-for-react-19';

import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./ui/layout/LayoutWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Apache Polaris Management Panel",
    description: "Manage your Apache Polaris Instance",
};

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
        </body>
        </html>
    );
}
