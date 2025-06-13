import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "QA Checklist - Element Cleaning Systems",
	description:
		"Professional mobile-optimized quality assurance inspection system for field teams",
	generator: "Element Cleaning Systems",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "QA Checklist",
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "QA Checklist",
		"msapplication-TileColor": "#4BAA47",
		"msapplication-config": "/browserconfig.xml",
	},
};

export function generateViewport() {
	return {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
		viewportFit: "cover",
		themeColor: "#4BAA47",
	};
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
				<link
					rel="apple-touch-icon"
					sizes="152x152"
					href="/icons/apple-touch-icon-152x152.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/icons/apple-touch-icon-180x180.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="167x167"
					href="/icons/apple-touch-icon-167x167.png"
				/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="QA Checklist" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-config" content="/browserconfig.xml" />
				<meta name="msapplication-TileColor" content="#4BAA47" />
				<meta name="msapplication-tap-highlight" content="no" />
				<meta name="theme-color" content="#4BAA47" />
			</head>
			<body className={inter.className}>
				{children}
				<Toaster position="top-right" richColors />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							if ('serviceWorker' in navigator) {
								window.addEventListener('load', function() {
									navigator.serviceWorker.register('/sw.js')
										.then(function(registration) {
											console.log('SW registered: ', registration);
										})
										.catch(function(registrationError) {
											console.log('SW registration failed: ', registrationError);
										});
								});
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}
