import { useCallback, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

interface SearchProps {
  members: string[];
  seasons: string[];
  collections: string[];
  selectedMembers: string[];
  selectedSeasons: string[];
  selectedClasses: string[];
  selectedCollections: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onReset: () => void;
  onMatchesChange: (matches: {
    search: boolean;
    members: string[];
    seasons: string[];
    collections: string[];
    disabledFilters?: {
      members?: boolean;
      seasons?: boolean;
      classes?: boolean;
      artists?: boolean;
    };
  }) => void;
}

function Search({
  members = [],
  seasons,
  collections,
  onMatchesChange,
  searchQuery,
  setSearchQuery,
  onReset,
}: SearchProps) {
  // 定義season縮寫
  const seasonMapping: { [key: string]: string } = {
    A: "Atom01",
    B: "Binary01",
    C: "Cream01",
    D: "Divine01",
    E: "Ever01",
  };

  // 處理搜尋結果
  const handleMatches = useCallback(
    (matches: {
      search: boolean;
      members: string[];
      seasons: string[];
      collections: string[];
      disabledFilters?: {
        members?: boolean;
        seasons?: boolean;
        classes?: boolean;
        artists?: boolean;
      };
    }) => {
      if (onMatchesChange) {
        onMatchesChange(matches);
      }
    },
    [onMatchesChange]
  );

  useEffect(() => {
    let memberMatches: string[] = [];
    let seasonMatches: string[] = [];
    let collectionMatches: string[] = [];
    const disabledFilters: {
      members?: boolean;
      seasons?: boolean;
      classes?: boolean;
      artists?: boolean;
    } = {};

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const queryArray = query.split(" ").filter((term) => term.length > 0);
      console.log("query:", query);
      console.log("queryArray:", queryArray);

      // 檢查輸入是否包含英文數字以外的符號
      const hasInvalidCharacters = /[^a-zA-Z0-9\s]/.test(query);
      if (hasInvalidCharacters) {
        console.log("Invalid input: only special characters detected.");
        disabledFilters.members = true;
        disabledFilters.seasons = true;
        disabledFilters.classes = true;
        disabledFilters.artists = true;
        console.log("disabledFilters:", disabledFilters);
        handleMatches({
          search: true,
          members: [],
          seasons: [],
          collections: [],
          disabledFilters,
        });

        return;
      }

      // 拆解搜尋輸入字串成數個子字串遍歷
      queryArray.forEach((substring) => {
        console.log("我在遍歷substing: ", substring);
        const seasonFullName = seasonMapping[substring[0].toUpperCase()];
        const stringAfterFirstChar = substring.slice(1);

        // 如果子字串是數字開頭 (例：1、201)
        if (!/[a-zA-Z]/.test(substring[0])) {
          const newCollections = collections.filter((collection) =>
            collection.startsWith(substring)
          );
          collectionMatches = [
            ...new Set([...collectionMatches, ...newCollections]),
          ];
          console.log("collectionMatches在這: ", collectionMatches);
          disabledFilters.classes = true;
        }

        // 如果子字串只有一個字且是season縮寫 (例：A、B、C、D、E)
        if (substring.length === 1 && seasonFullName) {
          console.log("代表季節是: ", seasonFullName);

          seasonMatches = [...new Set([...seasonMatches, seasonFullName])];
          console.log("seasonMatches在這: ", seasonMatches);
          disabledFilters.seasons = true;

          // 如果子字串只有一個字但不是season縮寫 (例：G、Z)
        } else if (substring.length === 1 && !seasonFullName) {
          const newMembers = members.filter((member) =>
            member.toLowerCase().includes(substring.toLowerCase())
          );
          memberMatches = [...new Set([...memberMatches, ...newMembers])];
          console.log("memberMatches在這: ", memberMatches);
          disabledFilters.members = true;
          disabledFilters.artists = true;
        }

        // 如果第一個字後面接的是數字 (例：D2、D20、D207、D2077)
        if (seasonFullName && /[0-9]/.test(stringAfterFirstChar)) {
          const newCollections = collections.filter((collection) =>
            collection.startsWith(stringAfterFirstChar)
          );
          collectionMatches = [
            ...new Set([...collectionMatches, ...newCollections]),
          ];
          console.log("collectionMatches在這: ", collectionMatches);
          seasonMatches = [...new Set([...seasonMatches, seasonFullName])];

          disabledFilters.seasons = true;
          disabledFilters.classes = true;
        }

        console.log("我在這: ", stringAfterFirstChar);

        // 如果第一個字後面接的是英文 (例：Da、Dahyun)
        if (/[a-zA-Z]/.test(stringAfterFirstChar)) {
          const newMembers = members.filter((member) => {
            return member
              .toLowerCase()
              .includes(stringAfterFirstChar.toLowerCase());
          });

          memberMatches = [...new Set([...memberMatches, ...newMembers])];
          console.log("memberMatches在這: ", memberMatches);
          disabledFilters.members = true;
          disabledFilters.artists = true;
        }
      });

      if (
        memberMatches.length === 0 &&
        seasonMatches.length === 0 &&
        collectionMatches.length === 0
      ) {
        disabledFilters.members = true;
        disabledFilters.seasons = true;
        disabledFilters.classes = true;
        disabledFilters.artists = true;
      }
      // 檢查字串是否包含member
      const memberTermIndex = queryArray.findIndex((term) =>
        members.some((m) => m.toLowerCase().includes(term.toLowerCase()))
      );
      const memberTerm =
        memberTermIndex !== -1 ? queryArray[memberTermIndex] : null;

      // 按照子字串與成員名字相關度排序
      memberMatches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const queryLower = memberTerm ? memberTerm.toLowerCase() : "";

        // 規則1：子字串完全符合成員名字
        const aIsExactMatch = aLower === queryLower;
        const bIsExactMatch = bLower === queryLower;
        if (aIsExactMatch && !bIsExactMatch) return -1;
        if (!aIsExactMatch && bIsExactMatch) return 1;

        // 規則2：子字串符合成員名字開頭
        const aStartsWith = aLower.startsWith(queryLower);
        const bStartsWith = bLower.startsWith(queryLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // 規則3：子字串部分符合成員名字
        const aIndex = aLower.indexOf(queryLower);
        const bIndex = bLower.indexOf(queryLower);
        return aIndex - bIndex;
      });

      console.log("Member matches:", memberMatches);
      console.log("Season matches:", seasonMatches);
      console.log("Collection matches:", collectionMatches);
      console.log("Disabled filters:", disabledFilters);

      const newMatches = {
        search: true,
        members: memberMatches,
        seasons: seasonMatches,
        collections: collectionMatches,
        disabledFilters,
      };

      handleMatches(newMatches);
    } else {
      // 輸入框沒有輸入文字時
      handleMatches({
        search: false,
        members: [],
        seasons: [],
        collections: [],
      });
    }
  }, [searchQuery, members, seasons, collections, handleMatches]);

  return (
    <div className="flex justify-center items-center">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mr-2"
      ></Input>

      <Button onClick={() => onReset()} className="">
        RESET
      </Button>
    </div>
  );
}
export default Search;
