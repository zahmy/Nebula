// app/discord-oauth-callback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";

export interface User {
  discord_id: string;
  username: string;
  cosmo_id?: string;
  address?: string;
}

export default function DiscordOAuthCallback() {
  const { setUser } = useUser();
  const [hasProcessedCode, setHasProcessedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchUserData = async (code: string) => {
    try {
      const response = await fetch("/api/discord/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, details: ${JSON.stringify(errorData.details)}`);
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
      console.log("User data:", userData.discord_id);

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
      router.push("/");
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setError(
        error instanceof Error
          ? `Failed to authenticate with Discord: ${error.message}`
          : "An unknown error occurred"
      );
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    // const state = searchParams.get("state"); // 如果添加了 state，可以用來驗證

    if (code && !hasProcessedCode) {
      setHasProcessedCode(true);
      fetchUserData(code);
    }
  }, [hasProcessedCode, searchParams]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return <div>Loading...</div>;
}