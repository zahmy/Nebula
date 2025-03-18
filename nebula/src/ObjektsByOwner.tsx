import ShowObjekts from "./ShowObjekts";
import FilterDropdown from "./DropdownFilter";
import Search from "./Search";
import { fetchObjektsByOwner, ObjektByOwner } from "./api_owner";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { UseObjektsData } from "./UseObjektsData";

function ObjektsByOwner() {
  const wrappedFetchObjektsByOwner = (
    search: boolean,
    season: string[],
    class_: string[],
    member: string[],
    collection: string[],
    address?: string
  ): Promise<ObjektByOwner[]> => {
    if (!address) {
      return Promise.reject(
        new Error("Address is required for ObjektsByOwner")
      );
    }
    return fetchObjektsByOwner(
      address,
      search,
      season,
      class_,
      member,
      collection
    );
  };

  const {
    loading,
    error,
    selectedSeasons,
    selectedClasses,
    selectedMembers,
    selectedCollections,
    collections,
    seasons,
    classes,
    members,
    disabledFilters,
    rowItems,
    handleSeasonsChange,
    handleClassesChange,
    handleMembersChange,
    handleMatchesChange,
    address,
    setAddress,
    setLoading,
    setError,
    setObjekts,
  } = UseObjektsData<ObjektByOwner>({
    fetchFunction: wrappedFetchObjektsByOwner,
    defaultAddress: "",
  });

  // 處理搜尋按鈕行為，之後討論要不要保留
  const handleFetchObjekts = () => {
    if (!address) {
      console.log("Address is empty, aborting fetch");
      return;
    }
    console.log("Button clicked, fetching with address:", address);
    setLoading(true);
    setError(null);
    fetchObjektsByOwner(
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
          {/* 搜尋 */}
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
            onSelectionChange={handleSeasonsChange}
            disabled={disabledFilters.seasons}
          />

          {/* Class選單 */}
          <FilterDropdown
            label="Class"
            items={classes}
            selectedItems={selectedClasses}
            onSelectionChange={handleClassesChange}
            disabled={disabledFilters.classes}
          />

          {/* Member選單 */}
          <FilterDropdown
            label="Memeber"
            items={members}
            selectedItems={selectedMembers}
            onSelectionChange={handleMembersChange}
            disabled={disabledFilters.members}
          />
        </div>
        <ShowObjekts loading={loading} error={error} rowItems={rowItems} />
      </div>
    </div>
  );
}

export default ObjektsByOwner;
