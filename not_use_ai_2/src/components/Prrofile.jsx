import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Prrofile = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const limit = 20;

    // ✅ Debounce: ৫০০ms পর search হবে
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // নতুন search-এ page 1
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // ✅ Fetch Data
    useEffect(() => {
        fetch();
    }, [search, page]);

    const fetch = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/upload/profile", {
                params: { search, page, limit }
            });
            setData(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const searchbar = (e) => {
        setSearchInput(e.target.value);
    };

const n="naime   hossen ia    a developer"

console.log(n.replace(/\s{2}/g, ""));





    

    return (
        <div className='min-h-screen bg-slate-900 p-4'>
            <h1 className='text-white text-3xl font-bold text-center mb-8'>
                🔍 Image Search
            </h1>

            {/* Search Input */}
            <div className='max-w-2xl mx-auto mb-8'>
                <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-xl'>🔍</span>
                    <input
                        onChange={searchbar}
                        className='w-full p-4 pl-12 pr-12 bg-slate-800 text-white rounded-xl border-2 border-slate-700 focus:border-emerald-500 outline-none text-lg'
                        placeholder='ইমেজ খুঁজুন...'
                        type="text"
                    />
                    {searchInput && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setSearch('');
                            }}
                            className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xl'
                        >
                            ✕
                        </button>
                    )}
                </div>
                
                {/* Search Info */}
                {search && (
                    <p className='text-slate-400 mt-2'>
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

            {/* Empty State */}
            {!loading && data.length === 0 && (
                <div className='text-center py-16'>
                    <p className='text-6xl mb-4'>📭</p>
                    <p className='text-slate-400 text-xl'>
                        {search ? 'কোন ফলাফল পাওয়া যায়নি' : 'ইমেজ খুঁজুন'}
                    </p>
                </div>
            )}

            {/* Image Grid */}
            {!loading && data.length > 0 && (
                <>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {data.map((item) => (
                            <div
                                key={item._id || item.url}
                                className='bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 duration-300 group'
                            >
                                <div className='overflow-hidden'>
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className='w-full h-40 md:h-48 object-cover group-hover:scale-110 duration-500'
                                    />
                                </div>
                                <div className='p-3'>
                                    <p className='text-white font-semibold text-sm truncate'>
                                        {item.name}
                                    </p>
                                    <p className='text-slate-400 text-xs mt-1'>
                                        {item.size ? (item.size / 1024).toFixed(2) + ' KB' : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className='flex items-center justify-center gap-4 mt-8'>
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={pagination.currentPage === 1}
                                className='px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600'
                            >
                                ← আগে
                            </button>

                            <div className='flex gap-2'>
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                                            page === i + 1
                                                ? 'bg-emerald-500 text-white scale-110'
                                                : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!pagination.hasNextPage}
                                className='px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600'
                            >
                                পরে →
                            </button>
                        </div>
                    )}

                    {/* Page Info */}
                    <p className='text-slate-400 text-center mt-4'>
                        পেজ {pagination.currentPage} / {pagination.totalPages} | 
                        মোট {pagination.totalItems} টি
                    </p>
                </>
            )}
        </div>
    );
};

export default Prrofile;