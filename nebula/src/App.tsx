import { Link, Route, Routes } from "react-router";
import Objekts from "./pages/ObjektsPage.tsx";
import ObjektsByOwner from "./pages/OwnerPage.tsx";
import { ModeToggle } from "@/components/ui/mode-toggle.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Icon } from "@iconify/react";
import { supabase } from "./supabase.ts";
import { useEffect, useRef, useState } from "react";

// 定義使用者資料的類型
interface User {
	id: string;
	username: string;
	key: string;
}

export default function App() {
	const [user, setUser] = useState<User | null>(null);

	const handleDiscordLogin = () => {
		const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=1353343236315418705&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify`;
		window.location.href = DISCORD_AUTH_URL; // 跳轉到 Discord 授權頁面
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
							{/* Discord 登入按鈕 */}
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
						<ModeToggle /> {/* 切換Dark/Light mode的按鈕 */}
					</nav>

					<div className="pt-20">
						<Routes>
							<Route path="/" element={<Objekts />} />
							<Route path="/by-owner" element={<ObjektsByOwner />} />
							<Route
								path="/callback"
								element={<Callback setUser={setUser} />}
							/>{" "}
							{/* 處理回調 */}
						</Routes>
					</div>
				</TooltipProvider>
			</ThemeProvider>
		</div>
	);
}

interface CallbackProps {
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

function Callback({ setUser }: CallbackProps) {
	const hasProcessedCode = useRef(false); // 用於防止重複執行

	const fetchUserData = async (code: string) => {
		try {
			const response = await fetch("http://localhost:5000/discord/callback", {
				method: "POST",
				body: JSON.stringify({ code }),
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const { access_token } = await response.json();

			const userResponse = await fetch("https://discord.com/api/users/@me", {
				headers: { Authorization: `Bearer ${access_token}` },
			});

			if (!userResponse.ok) {
				throw new Error(`HTTP error! status: ${userResponse.status}`);
			}

			const userData: User = await userResponse.json();

			const { data: existingUser } = await supabase
				.from("users")
				.select("*")
				.eq("discord_id", userData.id)
				.single();

			if (!existingUser) {
				await supabase.from("users").insert({
					discord_id: userData.id,
					username: userData.username,
				});
			} else if (existingUser.username !== userData.username) {
				await supabase
					.from("users")
					.update({ username: userData.username })
					.eq("discord_id", userData.id);
			}

			setUser(userData);
			window.location.href = "/"; // 跳轉到首頁
		} catch (error) {
			console.error("Error in fetchUserData:", error);
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");

		if (code && !hasProcessedCode.current) {
			hasProcessedCode.current = true; // 標記已處理
			fetchUserData(code).then(() => {
				window.history.replaceState({}, document.title, "/callback"); // 清理 URL
			});
		}
	}, []); // 空依賴陣列，確保只在初次掛載時執行

	return <div>Loading...</div>;
}
