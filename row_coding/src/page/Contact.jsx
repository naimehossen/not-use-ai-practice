import MyResponsiveVirtualList from "../Components/ui/MyResponsiveVirtualList";
import {FaClock,FaStar,FaLevelUpAlt} from 'react-icons/fa'


 const Contact = () => {
const courses = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    title: `Course ${i + 1}`,
    category: ['Cloud', 'Security', 'ERP', 'AI', 'DevOps'][i % 5],
    level: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
    price: Math.floor(Math.random()* 500) + 100,
    rating: (Math.random() * 3 + 2).toFixed(1),
    duration: `${Math.floor(Math.random() * 40) + 10}h`,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
  }));




  return ( 
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Responsive Virtual List
      </h1>
      
      <MyResponsiveVirtualList
        items={courses}
        overscan={5}
        renderItem={(course, index) => (
          <div 
            className="h-full rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border"
            style={{ borderTop: `3px solid ${course.color}` }}
          >
            {/* Color Bar */}
            <div 
              className="w-full h-1 rounded-full mb-3"
              style={{ backgroundColor: course.color }}
            />
            
            {/* Title */}
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {course.title}
            </h3>
            
            {/* Category & Level */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {course.category}
              </span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                <FaLevelUpAlt className="inline mr-1" size={10} />
                {course.level}
              </span>
            </div>
            
            {/* Rating & Duration */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <FaClock />
                {course.duration}
              </span>
            </div>
            
            {/* Price & CTA */}
            <div className="flex items-center justify-between mt-auto">
              <span className="font-bold text-lg">${course.price}</span>
              <button className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 transition">
                Enroll
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};


export default Contact;