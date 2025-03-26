// src/pages/Profile.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

const supabase = createSupabaseClient(SUPABASE_URL!, SUPABASE_KEY!);


// 之後要把問號改掉，現在是開發方便用
export interface User {
	discord_id: string;
	username: string;
	cosmo_id?: string;
	address?: string;
}

interface objekt {
	collection_id: string;
}


export default function Profile() {
	const { discordId } = useParams<{ discordId: string }>();
	const router = useRouter();
	const { user: currentUser} = useUser();

	const [profile, setProfile] = useState<User | null>(null);
	const [objektsList_have, SetObjektsList_have] = useState<string[]>([]); // 儲存多個 objekt ID
	const [collectionId, setCollectionId] = useState(""); // 新增 objekt 的輸入
	const [searchUsername, setSearchUsername] = useState("");


	// 載入個人頁面資料
	useEffect(() => {
		const fetchProfile = async () => {
			console.log("Fetching profile for discordId:", discordId);
			// 獲取使用者基本資料
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("discord_id, username, cosmo_id")
				.eq("discord_id", discordId)
				.single();

			if (userError) {
				console.error("Error fetching profile:", userError);
				return;
			}

			// 獲取喜愛的 objekt
			const { data: objektData, error: objektError } = await supabase
				.from("objektsList_have")
				.select("collection_id")
				.eq("user_discord_id", userData.discord_id);

			if (objektError) {
				console.error("Error fetching favorite objekts:", objektError);
			}

			setProfile(userData);
			SetObjektsList_have(
				objektData
					? objektData.map((objekt: objekt) => objekt.collection_id)
					: []
			);
		};
		if (discordId) fetchProfile();
	}, [discordId]);

	// 新增喜愛的 objekt
	const handleAddobjekt = async () => {
		if (!currentUser || currentUser.discord_id !== discordId || !collectionId)
			return;

		const { error } = await supabase.from("objektsList_have").insert({
			user_discord_id: currentUser.discord_id,
			collection_id: collectionId,
		});

		if (error) {
			console.error("Error adding objekt:", error);
		} else {
			SetObjektsList_have([...objektsList_have, collectionId]);
			setCollectionId(""); // 清空輸入框
			alert("Objekt added successfully!");
		}
	};

	// 移除喜愛的 objekt
	const handleRemoveobjekt = async (collectionId: string) => {
		if (!currentUser || currentUser.discord_id !== discordId) return;

		const { error } = await supabase
			.from("objektsList_have")
			.delete()
			.eq("collection_id", collectionId)
			.eq("user_discord_id", profile!.discord_id);

		if (error) {
			console.error("Error removing objekt:", error);
		} else {
			SetObjektsList_have(
				objektsList_have.filter((objekt) => objekt !== collectionId)
			);
		}
	};

	// 查詢其他使用者
	const handleSearch = async () => {
		const { data, error } = await supabase
			.from("users")
			.select("discord_id")
			.eq("username", searchUsername)
			.single();

		if (error) {
			console.error("Error searching user:", error);
			alert("User not found!");
		} else if (data) {
			router.push(`/profile/${data.discord_id}`);
		}
	};

	if (!profile) return <div>Loading...</div>;

	const isOwnProfile = currentUser && currentUser.discord_id === discordId;

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-4">{profile.username} Profile</h2>

			{/* 顯示個人資料 */}
			<div className="mb-4">
				<p>
					<strong>Username:</strong> {profile.username}
				</p>
				<p>
					<strong>Objekts Have List:</strong>
				</p>
				{objektsList_have.length > 0 ? (
					<ul className="list-disc pl-5">
						{objektsList_have.map((objekt) => (
							<li key={objekt} className="flex justify-between items-center">
								{objekt}
								{isOwnProfile && (
									<button
										onClick={() => handleRemoveobjekt(objekt)}
										className="text-red-500 ml-2"
									>
										Remove
									</button>
								)}
							</li>
						))}
					</ul>
				) : (
					<p>No favorite objekts selected</p>
				)}
			</div>

			{/* 編輯個人資料（僅限本人） */}
			{isOwnProfile && (
				<div className="mb-4">
					<h3 className="text-xl font-semibold">Edit Profile</h3>
					<div className="flex flex-col gap-2">
						<Label>
							Add Favorite objekt:
							<Input
								type="text"
								value={collectionId}
								onChange={(e) => setCollectionId(e.target.value)}
								className="border p-2 w-full text-white"
							/>
						</Label>
						<Button
							onClick={handleAddobjekt}
							className="bg-green-500 text-white p-2 rounded"
						>
							Add
						</Button>
					</div>
				</div>
			)}

			{/* 查詢其他使用者 */}
			<div>
				<h3 className="text-xl font-semibold">Search Another User</h3>
				<div className="flex gap-2">
					<Input
						type="text"
						value={searchUsername}
						onChange={(e) => setSearchUsername(e.target.value)}
						placeholder="Enter Discord username"
						className="border p-2 flex-grow text-white"
					/>
					<Button
						onClick={handleSearch}
						className="bg-teal-500 text-white p-2 rounded"
					>
						Search
					</Button>
				</div>
			</div>
		</div>
	);
}
