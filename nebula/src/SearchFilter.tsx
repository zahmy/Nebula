import { useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useObjektsSearchLogic } from "./hooks/useObjektsSearchLogic";

interface DisabledFilters {
  members?: boolean;
  seasons?: boolean;
  classes?: boolean;
  artists?: boolean;
}

interface Matches {
  search: boolean;
  members: string[];
  seasons: string[];
  collections: string[];
  disabledFilters?: DisabledFilters;
}

interface SearchProps {
  members: string[];
  seasons: string[];
  collections: string[];
  onMatchesChange: (matches: Matches) => void;
  onReset: () => void;
}

export default function SearchFilter({ members, seasons, collections, onMatchesChange, onReset }: SearchProps) {
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
