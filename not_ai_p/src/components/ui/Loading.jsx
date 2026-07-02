const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className='fixed inset-0 bg-white/80 dark:bg-slate-900/80 z-50 flex flex-col items-center justify-center'>
      <div className='animate-spin text-4xl mb-4'>⚡</div>
      <p className='text-lg font-semibold animate-pulse'>{text}</p>
    </div>
  )
}

export default Loading