import { useState, useEffect, useCallback } from "react";
import { fetchAllCollections, fetchUniqueSeasons, Objekt } from "./api_objekts";
import { ObjektByOwner } from "./api_owner";

type ObjektType = Objekt | ObjektByOwner;

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
    address?: string
  ) => Promise<T[]>;
  defaultAddress?: string;
}

export function UseObjektsData<T extends ObjektType>({
  fetchFunction,
  defaultAddress = "",
}: UseObjektsDataOptions<T>) {
  const [objekts, setObjekts] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [columns, setColumns] = useState(getColumns());
  const [collections, setCollections] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<FilterOptions>({
    members: [],
    seasons: [],
    collections: [],
  });
  const [search, setSearch] = useState<boolean>(false);
  const [disabledFilters, setDisabledFilters] = useState<DisabledFilters>({});
  const [address, setAddress] = useState<string>(defaultAddress);

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
    return {
      seasons: finalSeasons,
      classes: selectedClasses,
      members: finalMembers,
      collections: finalCollections,
    };
  };

  // 透過API取得Objekts
  useEffect(() => {
    const { seasons, classes, members, collections } = getFinalFilters();
    setLoading(true);
    fetchFunction(search, seasons, classes, members, collections, address)
      .then((data) => {
        // 按照成員關聯性排序Objekts
        if (search && searchFilters.members.length > 0) {
          const memberOrder = new Map(
            searchFilters.members.map((member, index) => [
              member.toLowerCase(),
              index,
            ])
          );
          data.sort((a, b) => {
            const aIndex =
              memberOrder.get((a as Objekt).member.toLowerCase()) ?? Infinity;
            const bIndex =
              memberOrder.get((b as Objekt).member.toLowerCase()) ?? Infinity;
            return aIndex - bIndex;
          });
        }

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
    searchFilters.members,
    searchFilters.seasons,
    searchFilters.collections,
    search,
    address,
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
    columns,
    collections,
    seasons,
    classes,
    members,
    searchFilters,
    search,
    disabledFilters,
    rowItems,
    handleSeasonsChange,
    handleClassesChange,
    handleMembersChange,
    handleMatchesChange,
    address,
    setAddress,
  };
}
