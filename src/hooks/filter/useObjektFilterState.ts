import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getDataByArtist } from "@/lib/utils/filter/objektFilterUtils";

export interface DropdownFilterOptions {
	artists: string[];
	members: string[];
	seasons: string[];
	collections: string[];
	classes: string[];
}

export interface SearchFilterOptions {
	members: string[];
	seasons: string[];
	collections: string[];
}

export interface DropdownFiltersDisabled {
	artists?: boolean;
	members?: boolean;
	seasons?: boolean;
	classes?: boolean;
}

// useObjektsFilterState需要的參數
interface ObjektsFilters {
	available: DropdownFilterOptions;
	selected: DropdownFilterOptions;
	search: boolean;
	searchFilters: SearchFilterOptions;
	dropdownFiltersDisabled: DropdownFiltersDisabled;
	setAvailable: (key: keyof DropdownFilterOptions, value: string[]) => void;
	setSelected: (
		key: keyof DropdownFilterOptions,
		value: string[] | ((prev: string[]) => string[])
	) => void;
	setSearch: Dispatch<SetStateAction<boolean>>;
	setSearchFilters: Dispatch<SetStateAction<SearchFilterOptions>>;
	setDropdownFiltersDisabled: Dispatch<SetStateAction<DropdownFiltersDisabled>>;
	getFinalFilters: () => DropdownFilterOptions;
}

/*
    管理Objekt的選單和搜尋條件

    available: 目前可以勾選的所有條件    
    selected: 目前勾選的選單條件
    search: 是否有在搜尋框輸入文字
    searchFilters: 搜尋條件
    dropdownFiltersDisabled: 下拉選單是否禁用
    getFinalFilters: 取得選單和搜尋結合的最終條件
*/

export function useObjektsFilterState(): ObjektsFilters {
	const [available, setAvailableState] = useState<DropdownFilterOptions>({
		artists: ["artms", "tripleS"],
		members: [],
		seasons: [],
		collections: [],
		classes: [],
	});

	const [selected, setSelectedState] = useState<DropdownFilterOptions>({
		artists: [],
		members: [],
		seasons: [],
		collections: [],
		classes: [],
	});
	const [search, setSearch] = useState<boolean>(false);

	const [searchFilters, setSearchFilters] = useState<SearchFilterOptions>({
		members: [],
		seasons: [],
		collections: [],
	});

	const [dropdownFiltersDisabled, setDropdownFiltersDisabled] =
		useState<DropdownFiltersDisabled>({});

	const setAvailable = (key: keyof DropdownFilterOptions, value: string[]) => {
		setAvailableState((prev) => ({ ...prev, [key]: value }));
	};

	const setSelected = (
		key: keyof DropdownFilterOptions,
		value: string[] | ((prev: string[]) => string[])
	) => {
		setSelectedState((prev) => ({
			...prev,
			[key]: typeof value === "function" ? value(prev[key]) : value,
		}));
	};

	// 根據搜尋跟選單的篩選條件，回傳最終的篩選條件
	const getFinalFilters = () => {
		console.log("searchFilter: ", searchFilters);
		console.log("dropdownFilter: ", selected);
		const finalFilters = { ...selected };
		if (search) {
			if (searchFilters.members.length > 0)
				finalFilters.members = searchFilters.members;
			if (searchFilters.seasons.length > 0)
				finalFilters.seasons = searchFilters.seasons;
			if (searchFilters.collections.length > 0)
				finalFilters.collections = searchFilters.collections;
		}
		return finalFilters;
	};

	// 根據選擇的artist，更新member和season選單的選項
	useEffect(() => {
		const updateFilters = async () => {
			const { membersByArtist, seasonsByArtist } = await getDataByArtist(
				selected.artists
			);
			// 更新member和season選單的選項
			setAvailable("members", membersByArtist);
			setAvailable("seasons", seasonsByArtist);

			// 在已選擇member的情況下切換artist，要把不屬於新artist的member選項清除
			setSelected("members", (prev) =>
				prev.filter((member) => membersByArtist.includes(member))
			);
			setSelected("seasons", (prev) =>
				prev.filter((season) => seasonsByArtist.includes(season))
			);
		};
		if (selected.artists.length > 0) {
			updateFilters();
		}
	}, [selected.artists]);

	return {
		available,
		selected,
		search,
		searchFilters,
		dropdownFiltersDisabled,
		getFinalFilters,
		setAvailable,
		setSelected,
		setSearch,
		setSearchFilters,
		setDropdownFiltersDisabled,
	};
}
