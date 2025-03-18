import ShowObjekts from "./ShowObjekts";
import FilterDropdown from "./DropdownFilter";
import Search from "./Search";
import { fetchObjekts, Objekt } from "./api_objekts";
import { UseObjektsData } from "./UseObjektsData";

function Objekts() {
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
  } = UseObjektsData<Objekt>({ fetchFunction: fetchObjekts });

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
