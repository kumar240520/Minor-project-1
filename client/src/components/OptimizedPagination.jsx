import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * OPTIMIZED: Pagination Component
 * Features: Smart page range, ellipsis for large page counts
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20,
  totalItems,
  siblingCount = 1,
  className = '',
}) => {
  const [jumpPage, setJumpPage] = useState('');

  // OPTIMIZATION: Memoize page range calculation
  const pageRange = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, '...', ...middleRange, '...', totalPages];
  }, [currentPage, totalPages, siblingCount]);

  const handleJumpToPage = useCallback((e) => {
    e.preventDefault();
    const page = parseInt(jumpPage, 10);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      setJumpPage('');
    }
  }, [jumpPage, totalPages, currentPage, onPageChange]);

  // Don't render if only one page
  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items info */}
      {totalItems !== undefined && (
        <div className="text-sm text-slate-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageRange.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || page === currentPage}
              className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-violet-600 text-white'
                  : page === '...'
                  ? 'cursor-default text-slate-400'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {page === '...' ? <MoreHorizontal className="w-4 h-4" /> : page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jump to page */}
      {totalPages > 10 && (
        <form onSubmit={handleJumpToPage} className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-16 px-2 py-1 rounded border border-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="#"
          />
          <button
            type="submit"
            disabled={!jumpPage || parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
            className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Jump
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * OPTIMIZED: Infinite Scroll Hook
 * For pages that prefer infinite scroll over pagination
 */
export const useInfiniteScroll = (fetchFn, options = {}) => {
  const { limit = 20, enabled = true } = options;
  
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, limit);
      const newItems = result.data || [];
      
      if (newItems.length < limit) {
        setHasMore(false);
      }

      setItems(prev => page === 1 ? newItems : [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, limit, loading, hasMore, enabled]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [reset, loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refresh,
  };
};

/**
 * OPTIMIZED: Virtual List for large datasets
 * Renders only visible items
 */
export const useVirtualList = (items, options = {}) => {
  const {
    itemHeight = 80,
    overscan = 5,
    containerHeight = 600,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, scrollTop, itemHeight, overscan, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    onScroll,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto',
      position: 'relative',
    },
    contentStyle: {
      height: totalHeight,
      position: 'relative',
    },
  };
};
