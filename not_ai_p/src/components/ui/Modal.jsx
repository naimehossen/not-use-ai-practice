const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center' onClick={onClose}>
      <div className='bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4' onClick={e => e.stopPropagation()}>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>{title}</h2>
          <button onClick={onClose} className='text-2xl hover:text-red-500'>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal