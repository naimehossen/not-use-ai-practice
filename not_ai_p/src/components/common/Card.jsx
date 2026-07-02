// components/common/Card.jsx

const Card = ({
  children,           // Card-এর ভেতরের Content
  desin = '',     // Extra Custom Classes
  padding = 'p-6',    // Padding Control
  hover = true,       // Hover Effect On/Off
  Click,            // Click Handler (optional)
  variant = 'default' // 'default' | 'outline' | 'elevated'
}) => {
    
    
  // Base Styles (সব Card-এই লাগবে)
  const baseStyles = 'rounded-xl border transition-all duration-300';
  
  // Variant Styles
  const variants = {
    default: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg',
    outline: 'bg-transparent border-2 border-blue-500 dark:border-blue-400',
    elevated: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-2xl',
    naime:"bg-red-500 dark:bg-yellow-500"
  };
  
  // Hover Styles
  const hoverStyles = hover 
    ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' 
    : '';

  return (
    <div
      onClick={Click}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${hoverStyles}
        ${padding}
        ${desin}
      `}
    >
      {children}
    </div>
  );
};

export default Card;