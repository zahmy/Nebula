import { useCallback, useEffect, useRef, useState } from "react";
import ShowObjekts from "./ShowObjekts";
import FilterDropdown from "./DropdownFilter";
import Search from "./Search";
import {
  fetchAllCollections,
  fetchObjekts,
  fetchUniqueSeasons,
  ObjektByOwner,
} from "./api_owner";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

function ObjektsByOwner() {
  const [objekts, setObjekts] = useState<ObjektByOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [columns, setColumns] = useState(getColumns());
  const [collections, setCollections] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<{
    members: string[];
    seasons: string[];
    collections: string[];
  }>({ members: [], seasons: [], collections: [] }); // 儲存 Search 的篩選條件
  const [search, setSearch] = useState<boolean>(false);
  const [disabledFilters, setDisabledFilters] = useState<{
    members?: boolean;
    seasons?: boolean;
    classes?: boolean;
  }>({});

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

  // 處理season篩選條件，只監聽season不監聽address，不然還沒按search結果就出來了
  const addressRef = useRef(address);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // 合併篩選條件
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
    const currentAddress = addressRef.current;
    console.log(
      "useEffect - address:",
      currentAddress,
      "search:",
      search,
      "filters:",
      { seasons, classes, members, collections }
    );
    console.log("address: ", currentAddress);
    if (!currentAddress) {
      console.log("No address provided, skipping fetch");
      return;
    }
    setLoading(true);
    setError(null);
    fetchObjekts(currentAddress, search, seasons, classes, members, collections)
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
            const aIndex = memberOrder.get(a.member.toLowerCase()) ?? Infinity;
            const bIndex = memberOrder.get(b.member.toLowerCase()) ?? Infinity;
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
  ]);

  // 另外處理搜尋按鈕
  const handleFetchObjekts = () => {
    if (!address) {
      console.log("Address is empty, aborting fetch");
      return;
    }
    console.log("Button clicked, fetching with address:", address);
    setLoading(true);
    setError(null);
    fetchObjekts(
      address,
      false,
      selectedSeasons,
      selectedClasses,
      selectedMembers,
      selectedCollections
    )
      .then((data) => {
        console.log("Button fetch result:", data);
        setObjekts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Button fetch error:", err.message);
        setError(err.message);
        setLoading(false);
        setObjekts([]);
      });
  };

  const remind = !address.length ? "Please enter an address to search" : "";

  const toggleSelection = <T extends string>(prev: T[], value: T): T[] =>
    value
      ? prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      : [];

  const handleSeasonChange = (season: string) => {
    setSelectedSeasons((prevSelectedSeasons) =>
      toggleSelection(prevSelectedSeasons, season)
    );
  };

  const handleClassChange = (class_: string) => {
    setSelectedClasses((prevSelectedClasses) =>
      toggleSelection(prevSelectedClasses, class_)
    );
  };

  const handleMemberChange = (member: string) => {
    setSelectedMembers((prevSelectedMembers) =>
      toggleSelection(prevSelectedMembers, member)
    );
  };

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

  const handleMatchesChange = useCallback(
    (matches: {
      search: boolean;
      members: string[];
      seasons: string[];
      collections: string[];
      disabledFilters?: {
        members?: boolean;
        seasons?: boolean;
        classes?: boolean;
      };
    }) => {
      console.log("Matches changed:", matches);
      // 僅更新搜尋框的searchFilters，不影響選單的selected狀態
      setSearchFilters({
        members: matches.members,
        seasons: matches.seasons,
        collections: matches.collections,
      });
      setSearch(matches.search);
      setDisabledFilters(matches.disabledFilters || {});
    },
    []
  );

  return (
    <div>
      <div className="flex items-center mt-5">
        <Input
          type="text"
          value={address}
          className="w-50 mr-2"
          onChange={(e) => setAddress(e.target.value.toLowerCase())}
          placeholder="Enter an address"
        />
        <Button
          onClick={handleFetchObjekts}
          disabled={loading}
          className="bg-accent text-white hover:bg-accent/90 mr-5"
        >
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {remind}

      <div className="min-h-screen">
        <div className="flex items-center ml-5 mt-2">
          <Search
            members={members}
            seasons={seasons}
            collections={collections}
            selectedMembers={selectedMembers}
            selectedSeasons={selectedSeasons}
            selectedClasses={selectedClasses}
            selectedCollections={selectedCollections}
            onMatchesChange={handleMatchesChange}
          ></Search>

          {/* Season選單 */}
          <FilterDropdown
            label="Season"
            items={seasons}
            selectedItems={selectedSeasons}
            onSelectionChange={handleSeasonChange}
            disabled={disabledFilters.seasons}
          />

          {/* Class選單 */}
          <FilterDropdown
            label="Class"
            items={classes}
            selectedItems={selectedClasses}
            onSelectionChange={handleClassChange}
            disabled={disabledFilters.classes}
          />

          {/* Member選單 */}
          <FilterDropdown
            label="Memeber"
            items={members}
            selectedItems={selectedMembers}
            onSelectionChange={handleMemberChange}
            disabled={disabledFilters.members}
          />
        </div>
        <ShowObjekts loading={loading} error={error} rowItems={rowItems} />
      </div>
    </div>
  );
}

export default ObjektsByOwner;
