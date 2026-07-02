import React, { useEffect, useState,useRef } from 'react'
import axios from 'axios'

const par = () => {
  const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    
    // ✅ Search States
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const inputRef = useRef(null);
    
    const limit = 10;

    // ✅ Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // search-এ page 1
        }, 500); // 500ms delay
        
        return () => clearTimeout(timer);
    }, [searchInput]);

    // ✅ Fetch Data
    useEffect(() => {
        fetchData();
    }, [page, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/upload/get", {
                params: { 
                    page, 
                    limit,
                    search  // ✅ search পাঠাও
                }
            });
            setData(response.data.data);
            setPagination(response.data.pagination);
            
            
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    // ✅ Clear Search
    const clearSearch = () => {
        setSearchInput('');
        setSearch('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    console.log(searchInput);
    

  return (
          <div className='min-h-screen bg-slate-900 p-4 md:p-8'>
            {/* Search Bar */}
            <div className='max-w-2xl mx-auto mb-8'>
                <div className='relative group'>
                    {/* Search Icon */}
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 group-focus-within:text-orange-400'>
                        🔍
                    </span>
                    
                    {/* Search Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder='ইমেজ খুঁজুন...'
                        className='w-full p-4 pl-12 pr-12 bg-slate-800 text-white rounded-xl border-2 border-slate-700 focus:border-orange-500 outline-none text-lg transition-all duration-300'
                    />
                    
                    {/* Clear Button */}
                    {searchInput && (
                        <button
                            onClick={clearSearch}
                            className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xl'
                        >
                            ✕
                        </button>
                    )}
                </div>
                
                {/* Search Info */}
                {search && (
                    <p className='text-slate-400 mt-2 text-sm'>
                        "{search}" এর জন্য {pagination.totalItems || 0} টি ফলাফল
                    </p>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className='text-center py-16'>
                    <div className='inline-block animate-spin text-4xl'>⚡</div>
                    <p className='text-white mt-4'>খুঁজছি...</p>
                </div>
            )}

            {/* Image Grid */}
            {!loading && (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                    {data.length > 0 ? data.map((item, index) => (
                        <div 
                            key={index}
                            className='bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 duration-300 group cursor-pointer'
                        >
                            <div className='overflow-hidden'>
                                <img 
                                    src={item.url} 
                                    alt={item.name}
                                    className='w-full h-40 object-cover group-hover:scale-110 duration-500'
                                />
                            </div>
                            <div className='p-3'>
                                <p className='text-white font-semibold text-sm truncate'>
                                    {item.name}
                                </p>
                                <p className='text-slate-400 text-xs mt-1'>
                                    {(item.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className='col-span-full text-center py-16'>
                            <p className='text-6xl mb-4'>📭</p>
                            <p className='text-slate-400 text-xl'>
                                {search ? 'কোন ফলাফল পাওয়া যায়নি' : 'কোন ইমেজ নেই'}
                            </p>
                            {search && (
                                <button 
                                    onClick={clearSearch}
                                    className='mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600'
                                >
                                    সার্চ ক্লিয়ার করুন
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {data.length > 0 && (
                <div className='flex items-center justify-center gap-4 mt-8'>
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={!pagination.hasPrevPage}
                        className='px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600'
                    >
                        ← আগে
                    </button>
                    
                    <span className='text-white'>
                        পেজ {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className='px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600'
                    >
                        পরে →
                    </button>
                </div>
            )}
        </div>
    )
}

export default par
