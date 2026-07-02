import { Link } from "react-router-dom"


const Notfound = () => {
  return (
    <div>
      <h1 className='text-4xl font-bold text-center mt-20'>404 - Page Not Found</h1>
      <p className='text-center mt-4 text-gray-600'>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className='flex items-center justify-center text-4xl font-bold text-blue-500 hover:text-blue-700'>
        Go back to Home
      </Link>
    </div>
  )
}

export default Notfound
