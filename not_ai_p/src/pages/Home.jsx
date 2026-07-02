import Button from '../components/common/Button'
import Card from '../components/common/Card'

const Home = () => {
  return (
    <div className='max-w-7xl mx-auto p-8'>
      <h1 className='text-4xl font-bold mb-8 text-center'>Welcome to Not_AI</h1>
      <p className='text-xl text-center text-gray-600 dark:text-gray-400 mb-12'>
        Professional React + Tailwind Project Structure
      </p>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <h2 className='text-xl font-bold mb-4'>🚀 Fast</h2>
          <p className='text-gray-600 dark:text-gray-400'>Built with Vite for lightning-fast development.</p>
          <Button variant='primary' className='mt-4'>Learn More</Button>
        </Card>
        
        <Card>
          <h2 className='text-xl font-bold mb-4'>🎨 Styled</h2>
          <p className='text-gray-600 dark:text-gray-400'>Tailwind CSS with Dark Mode support.</p>
          <Button variant='outline' className='mt-4'>View Themes</Button>
        </Card>
        
        <Card>
          <h2 className='text-xl font-bold mb-4'>📱 Responsive</h2>
          <p className='text-gray-600 dark:text-gray-400'>Mobile-first design that works everywhere.</p>
          <Button variant='secondary' className='mt-4'>Test It</Button>
        </Card>
      </div>
    </div>
  )
}

export default Home