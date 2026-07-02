import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

const NotFound = () => {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center'>
      <h1 className='text-8xl font-bold text-blue-600 mb-4'>404</h1>
      <p className='text-2xl text-gray-600 dark:text-gray-400 mb-8'>Page Not Found</p>
      <Link to='/'>
        <Button variant='primary'>Go Home</Button>
      </Link>
    </div>
  )
}

export default NotFound