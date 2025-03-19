import ShowObjekts from "./ShowObjekts";
import FilterDropdown from "./DropdownFilter";
import Search from "./Search";
import { fetchObjekts, Objekts_ } from "./api";
import { DisplayObjekts } from "./DisplayObjekts";

function Objekts() {
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
    handleMatchesChange,
    handleArtistsChange,
    searchQuery,
    setSearchQuery,
    resetFiltersAndSearch,
  } = DisplayObjekts<Objekts_>({ fetchFunction: fetchObjekts });

  return (
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
        />

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
      </div>
      <ShowObjekts loading={loading} error={error} rowItems={rowItems} />
    </div>
  );
}

export default Objekts;
