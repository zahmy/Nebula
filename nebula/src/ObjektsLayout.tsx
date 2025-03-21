import { useState, useEffect } from "react";
import { Objekts_, Objekts_Owner } from "./apis/api-objekts";
import { useObjekts } from "./hooks/useObjektsData";

type ObjektType = Objekts_ | Objekts_Owner;

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
  requireOwner?: boolean;
}

export function DisplayObjekts<T extends ObjektType>({
  fetchFunction,
  requireOwner = false,
}: UseObjektsDataOptions<T>) {
  const {
    objekts,
    loading,
    error,
    selectedSeasons,
    selectedClasses,
    selectedMembers,
    selectedCollections,
    selectedArtists,
    collections,
    seasons,
    classes,
    members,
    artists,
    disabledFilters,
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
  } = useObjekts({
    fetchFunction,
    requireOwner,
  });

  const [columns, setColumns] = useState(getColumns());

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

  // 將數據傳給 ShowObjekts 進行渲染
  return {
    loading,
    error,
    selectedSeasons,
    selectedClasses,
    selectedMembers,
    selectedCollections,
    selectedArtists,
    collections,
    seasons,
    classes,
    members,
    artists,
    disabledFilters,
    rowItems,
    handleSeasonsChange,
    handleClassesChange,
    handleMembersChange,
    handleArtistsChange,
    handleMatchesChange,
    owner,
    setOwner,
    searchQuery,
    setSearchQuery,
    resetFiltersAndSearch,
  };
}

// 不同視窗寬度對應的Objekts顯示行數
function getColumns() {
  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}
