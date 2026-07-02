
// ✅ Memoized Card
import { useState, useCallback, useRef, useEffect, memo } from 'react';

import Custom from './../../hooks/hooksone.js'

const MyResponsiveVirtualList=memo(({ 
  items = [], 
  containerHeight, // আর fixed না, স্ক্রিন অনুযায়ী হবে
  overscan = 3,
  renderItem,
  className = '',
})=>{

  
 // 📱 Screen Size
  const { width, height,breakpoint } = Custom();
  
  // 📏 Container Ref
  const containerRef = useRef(null);//false true '' {} [] 
  
  // 📐 Dynamic Sizes (breakpoint অনুযায়ী)
  const sizes = {
    sm: { itemHeight: 150, itemWidth: '100%', columns: 1, gap: 8 },
    md: { itemHeight: 180, itemWidth: '100%', columns: 2, gap: 12 },
    lg: { itemHeight: 200, itemWidth: '100%', columns: 3, gap: 16 },
    xl: { itemHeight: 220, itemWidth: '100%', columns: 4, gap: 20 },
  };
  
  const currentSize = sizes[breakpoint];
   
  
  
  // 📊 Calculations
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  
  // Container Resize Observer
  useEffect(() => {

    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    
    observer.observe(container);
    return () => observer.disconnect();

  }, []);


  
  
  
  // Grid calculations
  const itemsPerRow = currentSize.columns;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const rowHeight = currentSize.itemHeight + currentSize.gap;

  


  

// ৩. এখন সাইডবারের সাইজ CSS বা জাভাস্ক্রিপ্ট দিয়ে যেভাবেই বদলান না কেন, উপরের ফাংশনটি কল হবে!
  // Visible rows
  const visibleRows = Math.ceil(containerSize.height / rowHeight) + overscan;
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - Math.floor(overscan / 2));
  const endRow = Math.min(startRow + visibleRows, totalRows);
  
  // Convert rows to items
  const startIndex = startRow * itemsPerRow;
  const endIndex = Math.min(endRow * itemsPerRow, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  
  // Total height
  const totalHeight = totalRows * rowHeight;
  const offsetY = startRow * rowHeight;
  const ff=items.slice(101,110)
  console.log('totalhight==',rowHeight);
  
  
  // Scroll Handler
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);


  return (
    
 <div className="w-full space-y-3">
      {/* 📊 Debug Panel */}
      <div className="bg-gray-900 text-white text-xs p-3 rounded-lg flex flex-wrap gap-3">
        <span>📱 {breakpoint.toUpperCase()}</span>
        <span>📐 {width}×{height}px</span>
        <span>📦 {items.length} items</span>
        <span>📋 {itemsPerRow} cols × {visibleRows} rows</span>
        <span>👁️ {endIndex - startIndex} visible</span>
        <span>💾 {items.length - (endIndex - startIndex)} saved</span>
      </div>












      {/* 📋 Virtual List */}
      <div 
        ref={containerRef}
        style={{ 
          height: containerHeight || 'calc(100vh - 200px)',
          overflow: 'auto',
        }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
        onScroll={handleScroll}
      >

        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {/* Grid Layout */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                gap: `${currentSize.gap}px`,
              }}
            >
              {visibleItems.map((item, i) => (
                <div 
                  key={startIndex + i} 
                  style={{ 
                    height: `${currentSize.itemHeight}px`,
                  }}
                >
                  {renderItem ? renderItem(item, startIndex + i) : (
                    <div className="border rounded-lg p-3 h-full flex items-center justify-center">
                      <span>{item?.title || item}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>









    </div> 

  )
})

export default MyResponsiveVirtualList;