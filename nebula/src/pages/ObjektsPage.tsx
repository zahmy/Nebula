import ObjektGrid from "@/features/objekt/components/ObjektGrid";
import DropdownFilter from "@/features/filters/components/DropdownFilter";
import SearchFilter from "@/features/filters/components/SearchFilter";
import { fetchObjekts, Objekts_Owner } from "../apis/api-objekts";
import { useObjektsLayout } from "@/features/objekt/utils/useObjektLayout";

export default function ObjektsPage() {
	const { filters, gridData } = useObjektsLayout<Objekts_Owner>({
		fetchFunction: fetchObjekts,
		requireOwner: false,
	});

	return (
		<div className="min-h-screen">
			<div className="flex items-center ml-5 mt-2">
				{/* Objekt搜尋框 */}
				<SearchFilter
					members={filters.available.members}
					seasons={filters.available.seasons}
					collections={filters.available.collections}
					onMatchesChange={filters.handleMatchesChange}
					onReset={filters.resetDropdownAndSearch}
				/>

				{/* Artist選單 */}
				<DropdownFilter
					label="Artist"
					items={filters.available.artists}
					selectedItems={filters.selected.artists}
					onSelectionChange={filters.handleArtistsChange}
					disabled={filters.dropdownFiltersDisabled.artists}
				/>

				{/* Member選單 */}
				<DropdownFilter
					label="Member"
					items={filters.available.members}
					selectedItems={filters.selected.members}
					onSelectionChange={filters.handleMembersChange}
					disabled={filters.dropdownFiltersDisabled.members}
				/>

				{/* Season選單 */}
				<DropdownFilter
					label="Season"
					items={filters.available.seasons}
					selectedItems={filters.selected.seasons}
					onSelectionChange={filters.handleSeasonsChange}
					disabled={filters.dropdownFiltersDisabled.seasons}
				/>

				{/* Class選單 */}
				<DropdownFilter
					label="Class"
					items={filters.available.classes}
					selectedItems={filters.selected.classes}
					onSelectionChange={filters.handleClassesChange}
					disabled={filters.dropdownFiltersDisabled.classes}
				/>
			</div>

			{/* 以Grid排列方式顯示Objekts */}
			<ObjektGrid
				loading={gridData.loading}
				error={gridData.error}
				rowItems={gridData.rowItems}
			/>
		</div>
	);
}
