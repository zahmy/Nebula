import { Dispatch, SetStateAction, useCallback } from "react";
import {
	fetchUniqueCollections,
	fetchUniqueSeasons,
	Objekts_,
	Objekts_Owner,
} from "@/lib/apis/api-objekts";
import { ARTIST_MEMBERS_MAPING, CLASSES } from "./objektConstants";
import {
	DropdownFilterOptions,
	DropdownFiltersDisabled,
	SearchFilterOptions,
} from "@/hooks/filter/useObjektFilterState";

type ObjektType = Objekts_ | Objekts_Owner;

export interface Matches {
	search: boolean;
	members: string[];
	seasons: string[];
	collections: string[];
	dropdownFiltersDisabled?: DropdownFiltersDisabled;
}

/*
    處理選單和搜尋條件的邏輯

    isInitialState: 檢查是否為初始狀態
    sortByMemberOrder: 依照member搜尋關聯性排序
    fetchAndUpdateObjekts: 取得Objekts資料並更新
    getDataByArtist: 根據artist取得對應的members, seasons, collections, classes
    toggleSelection: 選單打勾/不打勾 (如果是已經勾的就取消，如果沒勾就勾上)
    handleSeasonsChange: 處理選單選項勾不勾要做的事情
    handleClassesChange: 處理選單選項勾不勾要做的事情
    handleMembersChange: 處理選單選項勾不勾要做的事情
    handleArtistsChange: 處理選單選項勾不勾要做的事情
    useHandleMatchesChange: 處理搜尋條件改變要做的事情
    useResetDropdownAndSearch: 重設選單和搜尋條件
*/

// 檢查是否為初始狀態
export const isInitialState = (
	search: boolean,
	filters: DropdownFilterOptions
): boolean => {
	return (
		!search &&
		filters.artists.length === 0 &&
		filters.seasons.length === 0 &&
		filters.members.length === 0 &&
		filters.collections.length === 0 &&
		filters.classes.length === 0
	);
};

// 照著搜尋邏輯那邊排好的成員順序排序後端拿來的資料
export const sortByMemberOrder = <T extends ObjektType>(
	data: T[],
	members: string[]
): T[] => {
	if (!members.length) return data;
	const memberOrder = new Map(
		members.map((member, index) => [member.toLowerCase(), index])
	);
	return data.sort(
		(a, b) =>
			(memberOrder.get(a.member.toLowerCase()) ?? Infinity) -
			(memberOrder.get(b.member.toLowerCase()) ?? Infinity)
	);
};

// 取得Objekts資料並按照成員搜尋關聯性排序(如果搜尋條件有成員)
export const fetchObjektsByFilters = async <T extends ObjektType>(
	fetchFunction: (
		search: boolean,
		artists: string[],
		members: string[],
		seasons: string[],
		collections: string[],
		classes: string[],
		owner?: string
	) => Promise<T[]>,
	search: boolean,
	artists: string[],
	members: string[],
	seasons: string[],
	collections: string[],
	classes: string[],
	owner: string | undefined,
	searchFilters: SearchFilterOptions,
	setObjekts: (data: T[]) => void,
	setLoading: (loading: boolean) => void,
	setError: (error: string | null) => void
) => {
	console.log("finalFilters: ", {
		search,
		artists,
		members,
		seasons,
		collections,
		classes,
		owner,
	});

	setLoading(true);

	try {
		const data = await fetchFunction(
			search,
			artists,
			members,
			seasons,
			collections,
			classes,
			owner
		);
		// console.log("Fetched data for tripleS: ", data);

		// 如果有搜尋條件，就依照成員搜尋關聯性排序
		const sortedData = sortByMemberOrder(data, searchFilters.members);

		console.log("Data received:", sortedData);
		setObjekts(sortedData);
	} catch (err) {
		setError((err as Error).message);
	} finally {
		setLoading(false);
	}
};

// 根據artist取得對應的members, seasons, collections, classes
export const getDataByArtist = async (selectedArtists: string[]) => {
	const artistsToFetch =
		selectedArtists.length === 0 ? ["tripleS", "artms"] : selectedArtists;
	const membersByArtist = Array.from(
		new Set(
			artistsToFetch.flatMap((artist) => ARTIST_MEMBERS_MAPING[artist] || [])
		)
	);
	const seasonsByArtist = await fetchUniqueSeasons(artistsToFetch);
	const collectionByArtist = await fetchUniqueCollections(artistsToFetch);
	return {
		membersByArtist,
		seasonsByArtist,
		collectionByArtist,
		classes: CLASSES,
	};
};

// 選單打勾/不打勾 (如果是已經勾的就取消，如果沒勾就勾上)
export const toggleSelection = <T extends string>(prev: T[], value: T): T[] =>
	prev.includes(value)
		? prev.filter((item) => item !== value)
		: [...prev, value];

// 處理選單選項勾不勾要做的事情
export const handleSeasonsChange =
	(setSelectedSeasons: Dispatch<SetStateAction<string[]>>) =>
	(season: string) =>
		setSelectedSeasons((prev) => toggleSelection(prev, season));

export const handleClassesChange =
	(setSelectedClasses: Dispatch<SetStateAction<string[]>>) =>
	(class_: string) =>
		setSelectedClasses((prev) => toggleSelection(prev, class_));

export const handleMembersChange =
	(setSelectedMembers: Dispatch<SetStateAction<string[]>>) =>
	(member: string) =>
		setSelectedMembers((prev) => toggleSelection(prev, member));

export const handleArtistsChange =
	(setSelectedArtists: Dispatch<SetStateAction<string[]>>) =>
	(artist: string) =>
		setSelectedArtists((prev) => toggleSelection(prev, artist));

// 處理搜尋條件改變要做的事情
export const useHandleMatchesChange = (
	setSearch: Dispatch<SetStateAction<boolean>>,
	setSearchFilters: Dispatch<
		SetStateAction<{
			members: string[];
			seasons: string[];
			collections: string[];
		}>
	>,
	setDropdownFiltersDisabled: Dispatch<
		SetStateAction<{
			members?: boolean;
			seasons?: boolean;
			classes?: boolean;
			artists?: boolean;
		}>
	>
) =>
	useCallback(
		(matches: Matches) => {
			setSearchFilters({
				members: matches.members,
				seasons: matches.seasons,
				collections: matches.collections,
			});
			setSearch(matches.search);
			setDropdownFiltersDisabled(matches.dropdownFiltersDisabled || {});
		},
		[setSearchFilters, setSearch, setDropdownFiltersDisabled]
	);

// 重設選單和搜尋條件
export const useResetDropdownAndSearch = (
	setSelectedArtists: Dispatch<SetStateAction<string[]>>,
	setSelectedMembers: Dispatch<SetStateAction<string[]>>,
	setSelectedSeasons: Dispatch<SetStateAction<string[]>>,
	setSelectedCollections: Dispatch<SetStateAction<string[]>>,
	setSelectedClasses: Dispatch<SetStateAction<string[]>>,
	setSearch: Dispatch<SetStateAction<boolean>>,
	setSearchFilters: Dispatch<
		SetStateAction<{
			members: string[];
			seasons: string[];
			collections: string[];
		}>
	>,
	setDropdownFiltersDisabled: Dispatch<
		SetStateAction<{
			members?: boolean;
			seasons?: boolean;
			classes?: boolean;
			artists?: boolean;
		}>
	>
) =>
	useCallback(() => {
		setSelectedSeasons([]);
		setSelectedClasses([]);
		setSelectedMembers([]);
		setSelectedCollections([]);
		setSelectedArtists([]);
		setSearchFilters({ members: [], seasons: [], collections: [] });
		setSearch(false);
		setDropdownFiltersDisabled({});
	}, [
		setSelectedSeasons,
		setSelectedClasses,
		setSelectedMembers,
		setSelectedCollections,
		setSelectedArtists,
		setSearchFilters,
		setSearch,
		setDropdownFiltersDisabled,
	]);
