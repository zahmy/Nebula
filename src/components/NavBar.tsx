"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function NavBar() {
  const { user } = useUser();
  const [profileLink, setProfileLink] = useState("#");

  useEffect(() => {
    if (user?.discord_id) {
      setProfileLink(`/profile/${user.discord_id}`);
    }
  }, [user]);

  const handleDiscordLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=1353343236315418705&response_type=code&redirect_uri=${encodeURIComponent(
      "http://localhost:3000/discord-oauth-callback"
    )}&scope=identify&state=${state}`;
    window.location.href = DISCORD_AUTH_URL;
  };

  return (
    <nav className="flex justify-between items-center border-b border-indigo-400/40 bg-linear-to-r/increasing from-indigo-400/30 via-teal-400/40 to-purple-400/30 backdrop-blur-lg p-3 shadow-lg fixed top-0 left-0 right-0 z-50">
      <h1 className="text-3xl ml-3 font-bold">Nebula</h1>
      <div className="flex space-x-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/objekts">
              <Icon icon="streamline:cards" width={30} height={30} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            <p>Objekts</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/owner">
              <Icon icon="streamline:search-visual" width={30} height={30} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            <p>Owner</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={profileLink}>
              <Icon icon="mdi:account" width={30} height={30} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            <p>{user?.discord_id ? "My Profile" : "Login to view profile"}</p>
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
  );
}
