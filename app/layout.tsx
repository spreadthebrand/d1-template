import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
export const metadata: Metadata = { title: "CCB Network | Connect, Create, & Build", description: "Launch a web-first creator streaming network and prepare for future distribution." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><Providers><Header/><main>{children}</main><Footer/></Providers></body></html>; }
