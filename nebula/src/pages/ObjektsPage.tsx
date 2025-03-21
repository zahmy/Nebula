import ObjektsGrid from "../ObjektsGrid";
import FilterDropdown from "../DropdownFilter";
import Search from "../SearchFilter";
import { fetchObjekts, Objekts_Owner } from "../apis/api-objekts";
import { DisplayObjekts } from "../ObjektsLayout";

function Objekts() {
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
    handleMatchesChange,
    handleArtistsChange,
    resetFiltersAndSearch,
  } = DisplayObjekts<Objekts_Owner>({
    fetchFunction: fetchObjekts,
    requireOwner: false,
  });

  return (
    <div className="min-h-screen">
      <div className="flex items-center ml-5 mt-2">
        {/* 搜尋 */}
        <Search
          members={members}
          seasons={seasons}
          collections={collections}
          onMatchesChange={handleMatchesChange}
          onReset={resetFiltersAndSearch}
        />

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
      </div>
      <ObjektsGrid loading={loading} error={error} rowItems={rowItems} />
    </div>
  );
}

export default Objekts;
