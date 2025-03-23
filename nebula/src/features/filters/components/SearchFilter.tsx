import { useEffect } from "react";
import { useObjektsSearchLogic } from "../hooks/useObjektSearchLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Matches } from "../utils/objektFilterUtils";

interface SearchProps {
	members: string[];
	seasons: string[];
	collections: string[];
	onMatchesChange: (matches: Matches) => void;
	onReset: () => void;
}

// Objekts搜尋框
export default function SearchFilter({
	members,
	seasons,
	collections,
	onMatchesChange,
	onReset,
}: SearchProps) {
	const { searchQuery, setSearchQuery, matches } = useObjektsSearchLogic({
		members,
		seasons,
		collections,
	});

	useEffect(() => {
		onMatchesChange(matches);
	}, [matches, onMatchesChange]);

	return (
		<div className="flex justify-center items-center">
			<Input
				type="text"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="mr-2"
			/>
			<Button onClick={onReset}>RESET</Button>
		</div>
	);
}
