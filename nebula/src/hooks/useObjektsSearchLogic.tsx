import { useState, useMemo } from "react";


interface DisabledFilters {
  members?: boolean;
  seasons?: boolean;
  classes?: boolean;
  artists?: boolean;
}

export function useObjektsSearchLogic({
  members,
  seasons,
  collections,
}: {
  members: string[];
  seasons: string[];
  collections: string[];
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 定義 season 縮寫映射
  const seasonMapping: { [key: string]: string } = {
    A: "Atom01",
    B: "Binary01",
    C: "Cream01",
    D: "Divine01",
    E: "Ever01",
  };

  // 計算匹配結果
  const matches = useMemo(() => {
    let memberMatches: string[] = [];
    let seasonMatches: string[] = [];
    let collectionMatches: string[] = [];
    const disabledFilters: DisabledFilters = {};

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const queryArray = query.split(" ").filter((term) => term.length > 0);

      // 檢查是否包含無效字符
      const hasInvalidCharacters = /[^a-zA-Z0-9\s]/.test(query);
      if (hasInvalidCharacters) {
        disabledFilters.members = true;
        disabledFilters.seasons = true;
        disabledFilters.classes = true;
        disabledFilters.artists = true;
        return {
          search: true,
          members: [],
          seasons: [],
          collections: [],
          disabledFilters,
        };
      }

      // 遍歷每個子字串
      queryArray.forEach((substring) => {
        const seasonFullName = seasonMapping[substring[0].toUpperCase()];
        const stringAfterFirstChar = substring.slice(1);

        // 數字開頭（例如 "1", "201"）
        if (!/[a-zA-Z]/.test(substring[0])) {
          const newCollections = collections.filter((collection) =>
            collection.startsWith(substring)
          );
          collectionMatches = [...new Set([...collectionMatches, ...newCollections])];
          disabledFilters.classes = true;
        }

        // 單字母且為 season 縮寫（例如 "A", "B"）
        if (substring.length === 1 && seasonFullName) {
          seasonMatches = [...new Set([...seasonMatches, seasonFullName])];
          disabledFilters.seasons = true;
        }
        // 單字母但不是 season 縮寫（例如 "G"）
        else if (substring.length === 1 && !seasonFullName) {
          const newMembers = members.filter((member) =>
            member.toLowerCase().includes(substring.toLowerCase())
          );
          memberMatches = [...new Set([...memberMatches, ...newMembers])];
          disabledFilters.members = true;
          disabledFilters.artists = true;
        }

        // 字母後接數字（例如 "D2", "D207"）
        if (seasonFullName && /[0-9]/.test(stringAfterFirstChar)) {
          const newCollections = collections.filter((collection) =>
            collection.startsWith(stringAfterFirstChar)
          );
          collectionMatches = [...new Set([...collectionMatches, ...newCollections])];
          seasonMatches = [...new Set([...seasonMatches, seasonFullName])];
          disabledFilters.seasons = true;
          disabledFilters.classes = true;
        }

        // 字母後接字母（例如 "Da", "Dahyun"）
        if (/[a-zA-Z]/.test(stringAfterFirstChar)) {
          const newMembers = members.filter((member) =>
            member.toLowerCase().includes(stringAfterFirstChar.toLowerCase())
          );
          memberMatches = [...new Set([...memberMatches, ...newMembers])];
          disabledFilters.members = true;
          disabledFilters.artists = true;
        }
      });

      // 如果無匹配結果，禁用所有篩選器
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

      // 排序成員匹配結果
      const memberTermIndex = queryArray.findIndex((term) =>
        members.some((m) => m.toLowerCase().includes(term.toLowerCase()))
      );
      const memberTerm = memberTermIndex !== -1 ? queryArray[memberTermIndex] : null;

      memberMatches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const queryLower = memberTerm ? memberTerm.toLowerCase() : "";
        const aIsExactMatch = aLower === queryLower;
        const bIsExactMatch = bLower === queryLower;
        if (aIsExactMatch && !bIsExactMatch) return -1;
        if (!aIsExactMatch && bIsExactMatch) return 1;
        const aStartsWith = aLower.startsWith(queryLower);
        const bStartsWith = bLower.startsWith(queryLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        const aIndex = aLower.indexOf(queryLower);
        const bIndex = bLower.indexOf(queryLower);
        return aIndex - bIndex;
      });

      return {
        search: true,
        members: memberMatches,
        seasons: seasonMatches,
        collections: collectionMatches,
        disabledFilters,
      };
    }

    // 無輸入時返回空結果
    return {
      search: false,
      members: [],
      seasons: [],
      collections: [],
    };
  }, [searchQuery, members, seasons, collections]);

  return { searchQuery, setSearchQuery, matches };
}