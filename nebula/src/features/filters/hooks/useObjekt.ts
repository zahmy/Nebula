import { useEffect, useMemo, useState } from "react";
import { Objekts_, Objekts_Owner } from "@/apis/api-objekts";
import { useObjektsFilterState } from "@/features/filters/hooks/useObjektFilterState";
import {
	fetchObjektsByFilters,
	getDataByArtist,
	isInitialState,
	handleSeasonsChange,
	handleClassesChange,
	handleMembersChange,
	handleArtistsChange,
	useHandleMatchesChange,
	useResetDropdownAndSearch,
} from "@/features/filters/utils/objektFilterUtils";

type ObjektType = Objekts_ | Objekts_Owner;

// useObjekts需要的參數
interface UseObjektsData<T> {
	fetchFunction: (
		search: boolean,
		season: string[],
		class_: string[],
		member: string[],
		collection: string[],
		artist: string[],
		owner?: string
	) => Promise<T[]>;
	requireOwner?: boolean;
	owner?: string;
}

/*
    處理Objekts資料
*/

// 處理Objekts資料
export function useObjekts<T extends ObjektType>({
	fetchFunction,
	requireOwner = false,
	owner = "",
}: UseObjektsData<T>) {
	const [state, setState] = useState({
		objekts: [] as T[],
		loading: true,
		error: null as string | null,
	});
	const filters = useObjektsFilterState();

	const setObjekts = (objekts: T[]) =>
		setState((prev) => ({ ...prev, objekts }));
	const setLoading = (loading: boolean) =>
		setState((prev) => ({ ...prev, loading }));
	const setError = (error: string | null) =>
		setState((prev) => ({ ...prev, error }));

	const [initialObjekts, setInitialObjekts] = useState<T[]>([]);

	// 處理選單條件變更
	const handleArtistsChangeFn = handleArtistsChange((value) =>
		filters.setSelected("artists", value)
	);
	const handleMembersChangeFn = handleMembersChange((value) =>
		filters.setSelected("members", value)
	);
	const handleSeasonsChangeFn = handleSeasonsChange((value) =>
		filters.setSelected("seasons", value)
	);
	const handleClassesChangeFn = handleClassesChange((value) =>
		filters.setSelected("classes", value)
	);

	// 處理搜尋條件變更
	const handleMatchesChangeFn = useHandleMatchesChange(
		filters.setSearch,
		filters.setSearchFilters,
		filters.setDropdownFiltersDisabled
	);

	// 重設選單條件和搜尋條件
	const resetDropdownsAndSearchFn = useResetDropdownAndSearch(
		(artists) => filters.setSelected("artists", artists),
		(members) => filters.setSelected("members", members),
		(seasons) => filters.setSelected("seasons", seasons),
		(collections) => filters.setSelected("collections", collections),
		(classes) => filters.setSelected("classes", classes),
		filters.setSearch,
		filters.setSearchFilters,
		filters.setDropdownFiltersDisabled
	);

	// 設定頁面初始狀態
	useEffect(() => {
		// (OwnerPage專屬) 如果沒有輸入owner地址，就不拿Objekts資料直接return
		if (requireOwner && !owner) {
			setObjekts([]);
			setLoading(false);
			return;
		}

		// 如果有輸入owner地址，或不是OwnerPage，就拿初始Objekts資料
		const loadInitialData = async () => {
			try {
				const {
					membersByArtist,
					seasonsByArtist,
					collectionByArtist,
					classes,
				} = await getDataByArtist(["tripleS", "artms"]);
				filters.setAvailable("members", membersByArtist);
				filters.setAvailable("seasons", seasonsByArtist);
				filters.setAvailable("collections", collectionByArtist);
				filters.setAvailable("classes", classes);

				// 拿初始狀態的Objekts資料
				const data = await fetchFunction(false, [], [], [], [], [], owner);
				setState({ objekts: data, loading: false, error: null });

				// 將初始狀態的Objekts資料設成快取
				setInitialObjekts(data);
			} catch (err) {
				setState({
					loading: false,
					objekts: [],
					error: (err as Error).message,
				});
			}
		};
		loadInitialData();
	}, [owner, requireOwner]);

	// useEffect的依賴項抓出來易讀性較高
	const filterDependencies = useMemo(
		() => ({
			search: filters.search,
			searchMembers: filters.searchFilters.members,
			searchSeasons: filters.searchFilters.seasons,
			searchCollections: filters.searchFilters.collections,
			artists: filters.selected.artists,
			members: filters.selected.members,
			seasons: filters.selected.seasons,
			collections: filters.selected.collections,
			classes: filters.selected.classes,
		}),
		[
			filters.search,
			filters.searchFilters.members,
			filters.searchFilters.seasons,
			filters.searchFilters.collections,
			filters.selected.artists,
			filters.selected.members,
			filters.selected.seasons,
			filters.selected.collections,
			filters.selected.classes,
		]
	);

	// 根據搜尋條件更新Objekts資料
	useEffect(() => {
		// 取得最終的篩選條件
		const filtersData = filters.getFinalFilters();
		// console.log("Search filters & Dropdown filters: ", filters.getFinalFilters());

		// 如果搜尋條件跟快取的初始狀態一樣，就不重新拿資料
		if (isInitialState(filters.search, filtersData)) {
			setObjekts(initialObjekts);
		} else {
			// 根據搜尋條件拿Objekts資料
			fetchObjektsByFilters(
				fetchFunction,
				filters.search,
				filtersData.artists,
				filtersData.members,
				filtersData.seasons,
				filtersData.collections,
				filtersData.classes,
				owner || undefined,
				filters.searchFilters,
				setObjekts,
				setLoading,
				setError
			);
		}
	}, [filterDependencies, owner]);

	return {
		objekts: state.objekts,
		loading: state.loading,
		error: state.error,
		...filters,
		setObjekts,
		setLoading,
		setError,
		initialObjekts,
		handleSeasonsChange: handleSeasonsChangeFn,
		handleClassesChange: handleClassesChangeFn,
		handleMembersChange: handleMembersChangeFn,
		handleArtistsChange: handleArtistsChangeFn,
		handleMatchesChange: handleMatchesChangeFn,
		resetDropdownAndSearch: resetDropdownsAndSearchFn,
	};
}
