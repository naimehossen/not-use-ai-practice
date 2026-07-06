import { memo, useCallback, useState, useRef, useEffect } from "react";
import Custom from "../../hooks/hooksone";

const TEstcompo = memo(() => {
  const { width, height, breakpoint } = Custom();
  const [scrollTop, setScrollTop] = useState(0);
  const [containersize, setContainersizw] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  // 📏 ResizeObserver
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setContainersizw({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // 📊 Data
  const data = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    cous: `Course ${i + 1}`,
  }));

  // 🎯 Breakpoint Settings
  const itemsPerRow = breakpoint === "sm" ? 1 : breakpoint === "md" ? 2 : breakpoint === "lg" ? 3 : 4;
  const itemHeight = breakpoint === "sm" ? 150 : breakpoint === "md" ? 180 : breakpoint === "lg" ? 200 : 220;
  const gap = 8;

  // 🧮 Calculations
  const totalRows = Math.ceil(data.length / itemsPerRow);
  const rowHeight = itemHeight + gap;
  const totalHeight = totalRows * rowHeight;

  const startRow = Math.floor(scrollTop / rowHeight);
  const visibleRows = Math.ceil(containersize.height / rowHeight) + 1;
  const startIndex = startRow * itemsPerRow;
  const endIndex = Math.min(startIndex + (visibleRows * itemsPerRow), data.length);
  const visibleItems = data.slice(startIndex, endIndex);
  const offsetY = startRow * rowHeight;



  // 📜 Scroll Handler
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div className="p-4">
      {/* Status Bar */}
      <div className="flex gap-2 p-3 bg-black text-white rounded-md mb-3 text-sm items-center">
        <span className="font-bold">{breakpoint.toUpperCase()}</span>
        <span>{width}×{height}</span>
        <span>Items: {data.length}</span>
        <span>Cols: {itemsPerRow}</span>
        <span>Visible: {visibleItems.length}</span>
      </div>

      {/* 📦 Virtual Scroll Container */}
      <div
        ref={ref}
        style={{ height: "400px", overflow: "auto" }}
        className="bg-gray-50 rounded-lg border"
        onScroll={handleScroll}
      >
        {/* 📏 Spacer */}
        <div style={{ height: `${totalHeight}px`, position: "relative" }}>
          {/* 📍 Visible Items */}
          <div
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${offsetY}px)`,
              display: "grid",
              gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
              gap: `${gap}px`,
              width: "100%",
              padding: "0 8px",
            }}
          >
            {visibleItems.map((item) => (
              <div
                key={item.id}
                style={{ height: `${itemHeight}px` }}
                className="bg-white rounded-lg border shadow-sm flex items-center justify-center hover:bg-blue-50 transition"
              >
                {item.cous}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TEstcompo;