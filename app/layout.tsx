import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Mobile Janitorial Checklist",
	description:
		"Professional mobile-friendly janitorial inspection and quality assurance system",
	viewport:
		"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				{children}
				<Toaster position="top-right" richColors />
			</body>
		</html>
	);
}
