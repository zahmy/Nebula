import ObjektsGrid from "../ObjektsGrid";
import FilterDropdown from "../DropdownFilter";
import Search from "../SearchFilter";
import { fetchObjekts, Objekts_Owner } from "../apis/api-objekts";
import { Input } from "../components/ui/input";
import { DisplayObjekts } from "../ObjektsLayout";

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
    resetFiltersAndSearch,
  } = DisplayObjekts<Objekts_Owner>({
    fetchFunction: wrappedFetchObjektsByOwner,
    requireOwner: true,
  });

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
            onMatchesChange={handleMatchesChange}
            onReset={resetFiltersAndSearch}
          ></Search>

          {/* Artist選單 */}
          <FilterDropdown
            label="Artist"
            items={artists}
            selectedItems={selectedArtists}
            onSelectionChange={handleArtistsChange}
            disabled={disabledFilters.artists}
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

          {remind}
        </div>
        <ObjektsGrid loading={loading} error={error} rowItems={rowItems} />
      </div>
    </div>
  );
}

export default ObjektsByOwner;
