import { useState, useEffect } from "react";
import { User } from "./Profile"; // 從 Profile.tsx 導入 User 型別
import { createClient as createSupabaseClient } from "@supabase/supabase-js";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

// 定義 CallbackProps 介面
interface DiscordOAuthCallbackProps {
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function DiscordOAuthCallback({
	setUser,
}: DiscordOAuthCallbackProps) {
	const [hasProcessedCode, setHasProcessedCode] = useState(false);

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

			const discordData = await userResponse.json();
			const userData: User = {
				discord_id: discordData.id,
				username: discordData.username,
				cosmo_id: undefined,
			};
			console.log("ssss", userData.discord_id);

			// 插入或更新使用者資料到 Supabase
			const { data: existingUser, error: fetchError } = await supabase
				.from("users")
				.select("*")
				.eq("discord_id", userData.discord_id)
				.single();

			if (fetchError && fetchError.code !== "PGRST116") {
				throw fetchError;
			}

			if (!existingUser) {
				const { error: insertError } = await supabase.from("users").insert({
					discord_id: userData.discord_id,
					username: userData.username,
				});
				if (insertError) throw insertError;
				console.log("User inserted:", userData);
			} else if (existingUser.username !== userData.username) {
				const { error: updateError } = await supabase
					.from("users")
					.update({ username: userData.username })
					.eq("discord_id", userData.discord_id);
				if (updateError) throw updateError;
				console.log("User updated:", userData);
			}

			setUser(userData);
			window.location.href = "/";
		} catch (error) {
			console.error("Error in fetchUserData:", error);
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");

		if (code && !hasProcessedCode) {
			setHasProcessedCode(true);
			fetchUserData(code).then(() => {
				window.history.replaceState({}, document.title, "/callback");
			});
		}
	}, [hasProcessedCode]);

	return <div>Loading...</div>;
}
