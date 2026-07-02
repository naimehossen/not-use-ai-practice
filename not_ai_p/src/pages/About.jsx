import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { ENDPOINTS } from '../api/endpoints';
import Loading from '../components/ui/Loading';

const About = () => {
  const [page, setPage] = useState(1);
  const limit = 5;

  // ✅ Hooks FIRST!
  const { data, loading, error } = useFetch(
    `${ENDPOINTS.UPLOAD.LIST}?page=${page}&limit=${limit}`
  );



    


  try {
    const p=[];

if (data) {
  p.push(data)
}
  
  console.log(p);
  } catch (error) {
    console.log('sorry');
    
  }


  // ✅ Conditional Return AFTER Hooks!
  if (loading) return <Loading text='Loading Images...' />;
  if (error) return <div className='text-red-500 text-center py-16'>❌ {error}</div>;


  // ✅ Data Process
  const images = typeof data?.data === 'object' ? data.data : [];
  const pagination = data?.pagination || {};

  

  return (
    <div className='max-w-7xl mx-auto p-8'>

      <h1 className='text-4xl font-bold mb-8'>About Us</h1>
      
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
        {images.map((item) => (
          <div key={item._id} className='rounded-lg overflow-hidden shadow-lg'>
            <img src={item.url} alt={item.name} className='w-full h-40 object-cover' />
            <p className='text-sm p-2 text-center truncate'>{item.name}</p>
            <p className='text-xs text-gray-500 text-center'>{(item.size/1024).toFixed(2)} KB</p>
          </div>
        ))}
      </div>

      <div className='flex justify-center gap-4'>
        <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
          className='px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50'>← আগে</button>
        <span className='text-white py-2'>Page {pagination.currentPage} / {pagination.totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
          className='px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50'>পরে →</button>
      </div>
    </div>
  );
};

export default About;