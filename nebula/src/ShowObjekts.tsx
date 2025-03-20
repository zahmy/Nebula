import { useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Objekts_Owner } from "./api";
import "./index.css";
import { ObjektsSidebar } from "./ObjektsSidebar";

// 顯示Objekts所需資料
interface ShowObjektsProps {
  loading: boolean;
  error: string | null;
  rowItems: Objekts_Owner[][];
}

function ShowObjekts({ loading, error, rowItems }: ShowObjektsProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // 虛擬化：透過這些參數計算出目前視窗內應該要顯示哪幾列
  const virtualizer = useWindowVirtualizer({
    count: rowItems.length,
    // 每個虛擬單位的預估高度（根據視窗寬度動態調整）
    estimateSize: () => {
      return window.innerWidth >= 1024
        ? 300
        : window.innerWidth >= 768
        ? 280
        : 260;
    },
    // 視窗範圍外，上下各渲染列數
    overscan: 5,
    // 虛擬容器相對於視窗頂部的滾動偏移量，避免滾動誤判
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  // 一個陣列，存放目前視窗內的虛擬單元（多個Objekts列）
  const items = virtualizer.getVirtualItems();

  // Objekts正在載入或出現錯誤時顯示提示
  if (loading || error) {
    return (
      <div className={loading ? "text-gray-500" : "text-red-500"}>
        {loading ? "Loading..." : `Error: ${error}`}
      </div>
    );
  }

  return (
    <div ref={listRef} className="relative">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${
              items[0]?.start - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {items.map((virtualRow) => (
            <div
              key={virtualRow.key}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {rowItems[virtualRow.index].map((obj, idx) => (
                <div
                  key={`${virtualRow.index}-${idx}`}
                  className="m-2 w-[280px] text-center relative"
                >
                  <img
                    src={obj.front_image}
                    alt="front_image"
                    className="w-full max-w-[220px] mx-auto"
                    loading="lazy"
                  />

                  <ObjektsSidebar
                    collection={obj.collection_no}
                    serial={Number(obj.serial)}
                    text_color={obj.text_color}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShowObjekts;
