import { useState, useEffect, useCallback } from "react";
import {
  fetchAllCollections,
  fetchUniqueSeasons,
  Objekts_,
  Objekts_Owner,
} from "./api";

type ObjektType = Objekts_ | Objekts_Owner;

interface FilterOptions {
  members: string[];
  seasons: string[];
  collections: string[];
}

interface DisabledFilters {
  members?: boolean;
  seasons?: boolean;
  classes?: boolean;
  artists?: boolean;
}

interface Matches {
  search: boolean;
  members: string[];
  seasons: string[];
  collections: string[];
  disabledFilters?: DisabledFilters;
}

interface UseObjektsDataOptions<T> {
  fetchFunction: (
    search: boolean,
    season: string[],
    class_: string[],
    member: string[],
    collection: string[],
    artist: string[],
    owner?: string
  ) => Promise<T[]>;
  reqeuireOwner?: boolean;
}

export function DisplayObjekts<T extends ObjektType>({
  fetchFunction,
  reqeuireOwner = false,
}: UseObjektsDataOptions<T>) {
  const [objekts, setObjekts] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>(["tripleS"]);
  const [columns, setColumns] = useState(getColumns());
  const [collections, setCollections] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [artists] = useState<string[]>(["tripleS", "artms"]);
  const [searchFilters, setSearchFilters] = useState<FilterOptions>({
    members: [],
    seasons: [],
    collections: [],
  });
  const [search, setSearch] = useState<boolean>(false);
  const [disabledFilters, setDisabledFilters] = useState<DisabledFilters>({});
  const [owner, setOwner] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSeasons, setAllSeasons] = useState<string[]>([]);
  const [initialObjekts, setInitialObjekts] = useState<T[]>([]);

  // 不同視窗寬度對應的Objekts顯示行數
  function getColumns() {
    if (window.innerWidth >= 1024) return 5;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  // 隨著視窗寬度動態調整Objekts顯示行數
  useEffect(() => {
    const handleResize = () => {
      const newColumns = getColumns();
      setColumns(newColumns);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 全部Objekts所佔列數
  const rows = Math.ceil(objekts.length / columns);

  // 一個二維陣列，將Objekts以列為單位存放（因為渲染是一列一列的）
  const rowItems = Array.from({ length: rows }, (_, rowIndex) =>
    objekts.slice(rowIndex * columns, (rowIndex + 1) * columns)
  );

  // 合併搜尋及選單的篩選條件
  const getFinalFilters = () => {
    const finalMembers =
      search && searchFilters.members.length > 0
        ? searchFilters.members
        : selectedMembers;
    const finalSeasons =
      search && searchFilters.seasons.length > 0
        ? searchFilters.seasons
        : selectedSeasons;
    const finalCollections =
      search && searchFilters.collections.length > 0
        ? searchFilters.collections
        : selectedCollections;
    const finalArtists = selectedArtists;

    return {
      seasons: finalSeasons,
      classes: selectedClasses,
      members: finalMembers,
      collections: finalCollections,
      artists: finalArtists,
    };
  };

  // 初次獲取數據
  useEffect(() => {
    if (reqeuireOwner && !owner) {
      setObjekts([]);
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const data = await fetchFunction(
          false,
          [],
          [],
          [],
          [],
          ["tripleS"],
          owner || undefined
        );
        setObjekts(data);
        setInitialObjekts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [owner]);

  // 透過API取得Objekts
  useEffect(() => {
    const { seasons, classes, members, collections, artists } =
      getFinalFilters();

    const isInitialState =
      seasons.length === 0 &&
      classes.length === 0 &&
      members.length === 0 &&
      collections.length === 0 &&
      artists.length === 1 &&
      artists[0] === "tripleS" &&
      !search;

    if (isInitialState) {
      // 如果回到初始狀態，使用快取的初始數據
      setObjekts(initialObjekts);
    } else {
      const fetchFilteredData = async () => {
        console.log("useEffect被觸發:", {
          search,
          seasons,
          classes,
          members,
          collections,
          artists,
          owner,
        });
        setLoading(true);
        fetchFunction(
          search,
          seasons,
          classes,
          members,
          collections,
          artists,
          owner || undefined
        )
          .then((data) => {
            if (search && searchFilters.members.length > 0) {
              const memberOrder = new Map(
                searchFilters.members.map((member, index) => [
                  member.toLowerCase(),
                  index,
                ])
              );
              data.sort((a, b) => {
                const aIndex =
                  memberOrder.get((a as ObjektType).member.toLowerCase()) ??
                  Infinity;
                const bIndex =
                  memberOrder.get((b as ObjektType).member.toLowerCase()) ??
                  Infinity;
                return aIndex - bIndex;
              });
            }
            console.log("Data received:", data);
            setObjekts(data);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      };
      fetchFilteredData();
    }
  }, [
    selectedSeasons,
    selectedClasses,
    selectedMembers,
    selectedCollections,
    selectedArtists,
    searchFilters.members,
    searchFilters.seasons,
    searchFilters.collections,
    search,
    owner,
  ]);

  // 定義 artist 和 members 的對應關係
  const artistMembersMap: { [key: string]: string[] } = {
    tripleS: [
      "SeoYeon",
      "HyeRin",
      "JiWoo",
      "ChaeYeon",
      "YooYeon",
      "SooMin",
      "NaKyoung",
      "YuBin",
      "Kaede",
      "DaHyun",
      "Kotone",
      "YeonJi",
      "Nien",
      "SoHyun",
      "Xinyu",
      "Mayu",
      "Lynn",
      "JooBin",
      "HaYeon",
      "ShiOn",
      "ChaeWon",
      "Sullin",
      "SeoAh",
      "JiYeon",
    ],
    artms: ["HeeJin", "HaSeul", "KimLip", "JinSoul", "Choerry"], // 假設 artms 的成員名單
  };

  const allMembers = Array.from(
    new Set([...artistMembersMap.tripleS, ...artistMembersMap.artms])
  );

  // 設定seasons、classes、members
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAllCollections(),
      fetchUniqueSeasons(["tripleS", "artms"]),
    ])
      .then(([collectionNosData, seasonsData]) => {
        setCollections(collectionNosData);
        setClasses([
          "First",
          "Double",
          "Special",
          "Premier",
          "Welcome",
          "Zero",
        ]);
        setSeasons(seasonsData);
        setAllSeasons(seasonsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  // 根據 selectedArtists 動態更新 members 和 seasons
  useEffect(() => {
    const updateFilters = async () => {
      if (selectedArtists.length === 0) {
        setMembers(allMembers);
        setSeasons(allSeasons);
      } else {
        // 根據 selectedArtists 從 API 獲取對應的 members 和 seasons
        const newMembers = selectedArtists
          .flatMap((artist) => artistMembersMap[artist] || [])
          .filter((member, index, self) => self.indexOf(member) === index);

        const newSeasons = await fetchUniqueSeasons(selectedArtists);

        setMembers(newMembers);
        setSelectedMembers((prev) =>
          prev.filter((member) => newMembers.includes(member))
        );

        setSeasons(newSeasons);
        setSelectedSeasons((prev) =>
          prev.filter((season) => newSeasons.includes(season))
        );
      }
    };
    updateFilters();
  }, [selectedArtists]);

  const toggleSelection = <T extends string>(prev: T[], value: T): T[] =>
    value
      ? prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      : [];

  const handleSeasonsChange = (season: string) => {
    setSelectedSeasons((prevSelectedSeasons) =>
      toggleSelection(prevSelectedSeasons, season)
    );
  };

  const handleClassesChange = (class_: string) => {
    setSelectedClasses((prevSelectedClasses) =>
      toggleSelection(prevSelectedClasses, class_)
    );
  };

  const handleMembersChange = (member: string) => {
    setSelectedMembers((prevSelectedMembers) =>
      toggleSelection(prevSelectedMembers, member)
    );
  };

  const handleArtistsChange = (artist: string) => {
    setSelectedArtists((prevSelectedArtists) =>
      toggleSelection(prevSelectedArtists, artist)
    );
  };

  const handleMatchesChange = useCallback((matches: Matches) => {
    // 僅更新搜尋框的searchFilters，不影響選單的selected狀態
    setSearchFilters({
      members: matches.members,
      seasons: matches.seasons,
      collections: matches.collections,
    });
    setSearch(matches.search);
    setDisabledFilters(matches.disabledFilters || {});
  }, []);

  const resetFiltersAndSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedSeasons([]);
    setSelectedClasses([]);
    setSelectedMembers([]);
    setSelectedCollections([]);
    setSelectedArtists([]);
    setSearchFilters({
      members: [],
      seasons: [],
      collections: [],
    });
    setSearch(false);
    setDisabledFilters({});
  }, []);

  return {
    objekts,
    setObjekts,
    loading,
    setLoading,
    error,
    setError,
    selectedSeasons,
    setSelectedSeasons,
    selectedClasses,
    setSelectedClasses,
    selectedMembers,
    setSelectedMembers,
    selectedCollections,
    setSelectedCollections,
    selectedArtists,
    setSelectedArtists,
    columns,
    collections,
    seasons,
    classes,
    members,
    artists,
    searchFilters,
    search,
    disabledFilters,
    rowItems,
    handleSeasonsChange,
    handleClassesChange,
    handleMembersChange,
    handleMatchesChange,
    handleArtistsChange,
    owner,
    setOwner,
    searchQuery,
    setSearchQuery,
    resetFiltersAndSearch,
  };
}
