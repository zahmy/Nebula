import { useState, useMemo } from "react";
import { DropdownFiltersDisabled } from "./useObjektFilterState";
import { SEASON_MAPPING } from "../utils/objektConstants";

// 處理搜尋邏輯 (目前還有bug: 不能跨季搜尋多張不同編號的卡，例：seoyeon d201 e202會出現seoyeon d201 d202 e201 e202)
export function useObjektsSearchLogic({
	members,
	seasons,
	collections,
}: {
	members: string[];
	seasons: string[];
	collections: string[];
}) {
	const [searchQuery, setSearchQuery] = useState<string>("");

	const matches = useMemo(() => {
		let memberMatches: string[] = [];
		let seasonMatches: string[] = [];
		let collectionMatches: string[] = [];
		const dropdownFiltersDisabled: DropdownFiltersDisabled = {};

		if (searchQuery.length > 0) {
			const query = searchQuery.toLowerCase().trim();

			// 將搜尋字串依空格拆成各個子字串
			const queryArray = query.split(" ").filter((term) => term.length > 0);

			// 檢查是否包含無效字符，如果有則禁用所有選單並回傳空結果
			const hasInvalidCharacters = /[^a-zA-Z0-9\s]/.test(query);
			if (hasInvalidCharacters) {
				dropdownFiltersDisabled.members = true;
				dropdownFiltersDisabled.seasons = true;
				dropdownFiltersDisabled.classes = true;
				dropdownFiltersDisabled.artists = true;
				return {
					search: true,
					members: [],
					seasons: [],
					collections: [],
					dropdownFiltersDisabled,
				};
			}

			// 遍歷每個子字串
			queryArray.forEach((substring) => {
				const seasonFullName = SEASON_MAPPING[substring[0].toUpperCase()];
				const stringAfterFirstChar = substring.slice(1);

				// 數字開頭（例如 "1", "201"）
				if (!/[a-zA-Z]/.test(substring[0])) {
					const newCollections = collections.filter((collection) =>
						collection.startsWith(substring)
					);
					collectionMatches = [
						...new Set([...collectionMatches, ...newCollections]),
					];
					dropdownFiltersDisabled.classes = true;
				}

				// 單字母且為 season 縮寫（例如 "A", "B"）
				if (substring.length === 1 && seasonFullName) {
					seasonMatches = [...new Set([...seasonMatches, seasonFullName])];
					dropdownFiltersDisabled.seasons = true;
				}
				// 單字母但不是 season 縮寫（例如 "G"）
				else if (substring.length === 1 && !seasonFullName) {
					const newMembers = members.filter((member) =>
						member.toLowerCase().startsWith(substring.toLowerCase())
					);
					memberMatches = [...new Set([...memberMatches, ...newMembers])];
					dropdownFiltersDisabled.members = true;
					dropdownFiltersDisabled.artists = true;
				}

				// 字母後接數字（例如 "D2", "D207"）
				if (seasonFullName && /[0-9]/.test(stringAfterFirstChar)) {
					const newCollections = collections.filter((collection) =>
						collection.startsWith(stringAfterFirstChar)
					);
					collectionMatches = [
						...new Set([...collectionMatches, ...newCollections]),
					];
					seasonMatches = [...new Set([...seasonMatches, seasonFullName])];
					dropdownFiltersDisabled.seasons = true;
					dropdownFiltersDisabled.classes = true;
				}

				// 字母後接字母（例如 "Da", "Dahyun"）
				if (/[a-zA-Z]/.test(stringAfterFirstChar)) {
					const newMembers = members.filter((member) =>
						member.toLowerCase().startsWith(substring.toLowerCase())
					);
					memberMatches = [...new Set([...memberMatches, ...newMembers])];
					dropdownFiltersDisabled.members = true;
					dropdownFiltersDisabled.artists = true;
				}
			});

			// 如果沒搜尋到東西，禁用所有選單
			if (
				memberMatches.length === 0 &&
				seasonMatches.length === 0 &&
				collectionMatches.length === 0
			) {
				dropdownFiltersDisabled.members = true;
				dropdownFiltersDisabled.seasons = true;
				dropdownFiltersDisabled.classes = true;
				dropdownFiltersDisabled.artists = true;
			}

			// 按照關聯性排序成員
			const memberTermIndex = queryArray.findIndex((term) =>
				members.some((m) => m.toLowerCase().includes(term.toLowerCase()))
			);
			const memberTerm =
				memberTermIndex !== -1 ? queryArray[memberTermIndex] : null;

			memberMatches.sort((a, b) => {
				const aLower = a.toLowerCase();
				const bLower = b.toLowerCase();
				const queryLower = memberTerm ? memberTerm.toLowerCase() : "";
				const aIsExactMatch = aLower === queryLower;
				const bIsExactMatch = bLower === queryLower;
				if (aIsExactMatch && !bIsExactMatch) return -1;
				if (!aIsExactMatch && bIsExactMatch) return 1;
				const aStartsWith = aLower.startsWith(queryLower);
				const bStartsWith = bLower.startsWith(queryLower);
				if (aStartsWith && !bStartsWith) return -1;
				if (!aStartsWith && bStartsWith) return 1;
				const aIndex = aLower.indexOf(queryLower);
				const bIndex = bLower.indexOf(queryLower);
				return aIndex - bIndex;
			});

			return {
				search: true,
				members: memberMatches,
				seasons: seasonMatches,
				collections: collectionMatches,
				dropdownFiltersDisabled,
			};
		}

		// 無輸入時返回空結果
		return {
			search: false,
			members: [],
			seasons: [],
			collections: [],
		};
	}, [searchQuery, members, seasons, collections]);

	return { searchQuery, setSearchQuery, matches };
}
