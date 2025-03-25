import { Link, Navigate, Route, Routes } from "react-router-dom";
import Objekts from "./pages/ObjektsPage.tsx";
import ObjektsByOwner from "./pages/OwnerPage.tsx";
import Profile, { User } from "./pages/Profile.tsx"; // 導入 Profile 組件
import { ModeToggle } from "@/components/ui/mode-toggle.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import DiscordOAuthCallback from "./pages/DiscordOAuthCallback.tsx";
import CosmoOAuthCallback from "./pages/CosmoOAuthCallback.tsx";

export default function App() {
	const [user, setUser] = useState<User | null>(() => {
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});

	console.log("discord_id: ", user?.discord_id);

	useEffect(() => {
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
		} else {
			localStorage.removeItem("user");
		}
	}, [user]);

	const handleDiscordLogin = () => {
		const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=1353343236315418705&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify`;
		window.location.href = DISCORD_AUTH_URL;
	};

	return (
		<div>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<TooltipProvider>
					<nav className="flex justify-between items-center border-b border-indigo-400/40 bg-linear-to-r/increasing from-indigo-400/30 via-teal-400/40 to-purple-400/30 backdrop-blur-lg p-3 shadow-lg fixed top-0 left-0 right-0 z-50">
						<h1 className="text-3xl ml-3 font-bold">Nebula</h1>
						<div className="flex space-x-10">
							<Tooltip>
								<TooltipTrigger asChild>
									<Link to="/">
										<Icon icon="streamline:cards" width={30} height={30} />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="bottom" sideOffset={5}>
									<p>Objekts</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link to="/by-owner">
										<Icon
											icon="streamline:search-visual"
											width={30}
											height={30}
										/>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="bottom" sideOffset={5}>
									<p>Owner</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										to={user?.discord_id ? `/profile/${user.discord_id}` : "#"}
									>
										<Icon icon="mdi:account" width={30} height={30} />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="bottom" sideOffset={5}>
									<p>
										{user?.discord_id ? "My Profile" : "Login to view profile"}
									</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<button onClick={handleDiscordLogin}>
										<Icon icon="simple-icons:discord" width={30} height={30} />
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" sideOffset={5}>
									<p>{user ? `Hi, ${user.username}` : "Login with Discord"}</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="w-32" />
						<ModeToggle />
					</nav>
					<div className="pt-20">
						<Routes>
							<Route path="/" element={<Objekts />} />
							<Route path="/by-owner" element={<ObjektsByOwner />} />
							<Route
								path="/callback"
								element={<DiscordOAuthCallback setUser={setUser} />}
							/>
							<Route
								path="/callback-cosmo"
								element={<CosmoOAuthCallback setUser={setUser} />}
							/>
							<Route
								path="/profile/:discordId"
								element={
									user?.discord_id ? (
										<Profile currentUser={user} setUser={setUser} />
									) : (
										<Navigate to="/" replace />
									)
								}
							/>
						</Routes>
					</div>
				</TooltipProvider>
			</ThemeProvider>
		</div>
	);
}
