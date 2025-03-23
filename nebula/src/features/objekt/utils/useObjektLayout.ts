import { useState, useEffect } from "react";
import { useObjekts } from "@/features/filters/hooks/useObjekt";
import { Objekts_, Objekts_Owner } from "@/apis/api-objekts";

type ObjektType = Objekts_ | Objekts_Owner;

// useObjektsLayout需要的參數
interface UseObjektsLayoutData<T> {
	fetchFunction: (
		search: boolean,
		season: string[],
		class_: string[],
		member: string[],
		collection: string[],
		artist: string[],
		owner?: string
	) => Promise<T[]>;
	requireOwner?: boolean;
	owner?: string;
}

/*
    處理Objekts排列的邏輯
*/

// 排列好Objekts要怎麼顯示
export function useObjektsLayout<T extends ObjektType>({
	fetchFunction,
	requireOwner = false,
	owner = "",
}: UseObjektsLayoutData<T>) {
	const { objekts, loading, error, ...filters } = useObjekts({
		fetchFunction,
		requireOwner,
		owner,
	});

	const [columns, setColumns] = useState(getColumns());

	// 隨著視窗寬度動態調整Objekts顯示行數
	useEffect(() => {
		const handleResize = () => {
			const newColumns = getColumns();
			setColumns(newColumns);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// 全部Objekts所佔列數
	const rows = Math.ceil(objekts.length / columns);

	// 一個二維陣列，將Objekts以列為單位存放（因為渲染是一列一列的）
	const rowItems = Array.from({ length: rows }, (_, rowIndex) =>
		objekts.slice(rowIndex * columns, (rowIndex + 1) * columns)
	);

	// 將資料傳給ObjektGird進行渲染
	return {
		filters,
		gridData: { loading, error, rowItems },
	};
}

// 不同視窗寬度對應的Objekts顯示行數
function getColumns() {
	if (window.innerWidth >= 1024) return 5;
	if (window.innerWidth >= 768) return 3;
	if (window.innerWidth >= 640) return 2;
	return 1;
}
