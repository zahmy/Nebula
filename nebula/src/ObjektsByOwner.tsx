import ShowObjekts from "./ShowObjekts";
import FilterDropdown from "./DropdownFilter";
import Search from "./Search";
import { fetchObjekts, Objekts_Owner } from "./api";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { DisplayObjekts } from "./DisplayObjekts";

function ObjektsByOwner() {
  const wrappedFetchObjektsByOwner = (
    search?: boolean,
    season?: string[],
    class_?: string[],
    member?: string[],
    collection?: string[],
    artist?: string[],
    owner?: string
  ): Promise<Objekts_Owner[]> => {
    if (!owner) {
      return Promise.reject(
        new Error("Address is required for ObjektsByOwner")
      );
    }
    return fetchObjekts(
      search || false,
      season || [],
      class_ || [],
      member || [],
      collection || [],
      artist || [],
      owner
    );
  };

  const {
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
    setLoading,
    setError,
    setObjekts,
    searchQuery,
    setSearchQuery,
    resetFiltersAndSearch,
  } = DisplayObjekts<Objekts_Owner>({
    fetchFunction: wrappedFetchObjektsByOwner,
    defaultOwner: "",
  });

  // 處理搜尋按鈕行為，之後討論要不要移除
  const handleFetchObjekts = () => {
    if (!owner) {
      console.log("Address is empty, aborting fetch");
      return;
    }
    console.log("Button clicked, fetching with address:", owner);
    setLoading(true);
    setError(null);
    fetchObjekts(
      false,
      selectedSeasons,
      selectedClasses,
      selectedMembers,
      selectedCollections,
      selectedArtists,
      owner
    )
      .then((data) => {
        console.log("Button fetch result:", data);
        setObjekts(
          data.filter(
            (obj): obj is Objekts_Owner =>
              "minted_at" in obj &&
              "received_at" in obj &&
              "serial" in obj &&
              "transferable" in obj
          )
        );
        setLoading(false);
      })
      .catch((err) => {
        console.log("Button fetch error:", err.message);
        setError(err.message);
        setLoading(false);
        setObjekts([]);
      });
  };

  const remind = !owner.length ? "Please enter an address to search" : "";

  return (
    <div>
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
            onReset={resetFiltersAndSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          ></Search>

          {/* Artist選單 */}
          <FilterDropdown
            label="Artist"
            items={artists}
            selectedItems={selectedArtists}
            onSelectionChange={handleArtistsChange}
            disabled={false}
          />

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
            label="Member"
            items={members}
            selectedItems={selectedMembers}
            onSelectionChange={handleMembersChange}
            disabled={disabledFilters.members}
          />

          <Input
            type="text"
            value={owner}
            className="w-50 mr-2"
            onChange={(e) => setOwner(e.target.value.toLowerCase())}
            placeholder="Enter an address"
          />

          <Button
            onClick={handleFetchObjekts}
            disabled={loading}
            className="bg-accent text-white hover:bg-accent/90 mr-5"
          >
            {loading ? "Loading..." : "Search"}
          </Button>

          {remind}
        </div>
        <ShowObjekts loading={loading} error={error} rowItems={rowItems} />
      </div>
    </div>
  );
}

export default ObjektsByOwner;
