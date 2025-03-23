import ObjektsGrid from "@/features/objekt/components/ObjektGrid";
import DropdownFilter from "@/features/filters/components/DropdownFilter";
import SearchFilter from "@/features/filters/components/SearchFilter";
import { fetchObjekts, Objekts_Owner } from "../apis/api-objekts";
import { Input } from "../components/ui/input";
import { useObjektsLayout } from "@/features/objekt/utils/useObjektLayout";
import { useState } from "react";

export default function OwnerPage() {
	const [owner, setOwner] = useState<string>("");

	// console.log("Owner: ", owner);
	const wrappedFetchObjektsByOwner = (
		search?: boolean,
		artist?: string[],
		member?: string[],
		season?: string[],
		collection?: string[],
		class_?: string[],
		owner?: string
	): Promise<Objekts_Owner[]> => {
		if (!owner) {
			return Promise.reject(
				new Error("Address is required for ObjektsByOwner")
			);
		}
		return fetchObjekts(
			search || false,
			artist || [],
			member || [],
			season || [],
			collection || [],
			class_ || [],
			owner
		);
	};

	const { filters, gridData } = useObjektsLayout<Objekts_Owner>({
		fetchFunction: wrappedFetchObjektsByOwner,
		requireOwner: true,
		owner,
	});

	const remind = !owner.length ? "Please enter an address to search" : "";

	return (
		<div>
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
						items={["tripleS", "artms"]}
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

					{/* Owner搜尋框 */}
					<Input
						type="text"
						value={owner}
						className="w-50 mr-2"
						onChange={(e) => setOwner(e.target.value.toLowerCase())}
						placeholder="Enter an address"
					/>

					{remind}
				</div>
				{/* 以Grid排列方式顯示Objekts */}
				<ObjektsGrid
					loading={gridData.loading}
					error={gridData.error}
					rowItems={gridData.rowItems}
				/>
			</div>
		</div>
	);
}
