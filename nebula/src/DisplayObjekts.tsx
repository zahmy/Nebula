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
  defaultOwner?: string;
}

export function DisplayObjekts<T extends ObjektType>({
  fetchFunction,
  defaultOwner = "",
}: UseObjektsDataOptions<T>) {
  const [objekts, setObjekts] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [columns, setColumns] = useState(getColumns());
  const [collections, setCollections] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<FilterOptions>({
    members: [],
    seasons: [],
    collections: [],
  });
  const [search, setSearch] = useState<boolean>(false);
  const [disabledFilters, setDisabledFilters] = useState<DisabledFilters>({});
  const [owner, setOwner] = useState<string>(defaultOwner);
  const[searchQuery, setSearchQuery] = useState<string>("");
  console.log("Initial owner:", defaultOwner);

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

  // 透過API取得Objekts
  useEffect(() => {
    const { seasons, classes, members, collections, artists } = getFinalFilters();
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

  // 設定seasons、classes、members
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAllCollections(), fetchUniqueSeasons()])
      .then(([collectionNosData, seasonsData]) => {
        setCollections(collectionNosData);
        setSeasons(seasonsData);
        setClasses([
          "First",
          "Double",
          "Special",
          "Premier",
          "Welcome",
          "Zero",
        ]);
        setMembers([
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
        ]);
        setArtists([
          "tripleS",
          "artms",
        ])
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

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
