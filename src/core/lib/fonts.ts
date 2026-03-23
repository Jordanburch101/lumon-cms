import { Geist_Mono, Nunito_Sans } from "next/font/google";

export const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontVariables = `${nunitoSans.variable} ${geistMono.variable}`;
