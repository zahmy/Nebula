import { useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Objekt } from './api_objekts';
import './index.css';

interface ShowObjektsProps {
  loading: boolean;
  error: string | null;
  rowItems: Objekt[][];
}

function ShowObjekts({ loading, error, rowItems }: ShowObjektsProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: rowItems.length,
    estimateSize: () => {
      return window.innerWidth >= 1024 ? 300 : window.innerWidth >= 768 ? 280 : 260;
    },
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  const items = virtualizer.getVirtualItems();

  if (loading || error) {
    return (
      <div className={loading ? 'text-gray-500' : 'text-red-500'}>
        {loading ? 'Loading...' : `Error: ${error}`}
      </div>
    );
  }

  return (
    <div ref={listRef} className="relative">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${items[0]?.start - virtualizer.options.scrollMargin}px)` }}>
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
                  className="m-2 min-w-[150px] text-center"
                >
                  <div className="mb-2">
                    {obj.season} {obj.member} {obj.collection_no} {obj.class_}
                  </div>
                  <img
                    src={obj.front_image}
                    alt="front_image"
                    className="w-full max-w-[220px] mx-auto"
                    loading="lazy"
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