import "~/styles/globals.css";

import type { Metadata } from "next";
import { Architects_Daughter } from "next/font/google";
import { GameProvider } from "~/contexts/game-context";
import { MultiplayerProvider } from "~/contexts/multiplayer-context";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
	title: "Globetrotter - The Ultimate Travel Guessing Game",
	description: "A fun game where you guess destinations around the world!",
	icons: [{ rel: "icon", url: "/favicon.webp" }],
};

const architectsDaughter = Architects_Daughter({
	subsets: ["latin"],
	variable: "--font-architects-daughter",
	weight: "400",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${architectsDaughter.variable} antialiased`} suppressHydrationWarning>
			<body>
				<SessionProvider>
					<TRPCReactProvider>
						<GameProvider>
							<MultiplayerProvider>
								{children}
								<Toaster richColors position="top-right" />
							</MultiplayerProvider>
						</GameProvider>
					</TRPCReactProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
