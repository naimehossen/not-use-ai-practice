// components/common/Input.jsx

const Input = ({
  label,            // উপরের লেখা (যেমন: "আপনার নাম")
  name,             // input-এর নাম (Form Data-র জন্য)
  type = 'text',    // text, email, password, number
  placeholder,      // ভেতরের হালকা লেখা
  value,            // Controlled Component-এর Value
  onChange,         // Value Change Handler
  error,            // এরর মেসেজ দেখানোর জন্য
  icon,             // বাম পাশের ইমোজি বা আইকন
  required = false, // আবশ্যক কিনা
  disabled = false, // বন্ধ করা
  className = '',   // এক্সট্রা স্টাইল
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label (যদি থাকে) */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon (যদি থাকে) */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 
            ${icon ? 'pl-12' : ''} 
            rounded-lg 
            border-2 
            outline-none 
            transition-all 
            duration-200
            bg-white dark:bg-slate-800
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800'
                : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }
            ${className}
          `}
        />

        {/* Right Status Icon (যদি এরর থাকে বা সঠিক থাকে) */}
        {error && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-lg">
            ⚠️
          </span>
        )}
        {!error && value && type === 'email' && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-lg">
            ✅
          </span>
        )}
      </div>

      {/* Error Message (যদি থাকে) */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          <span>❌</span> {error}
        </p>
      )}
    </div>
  );
};

export default Input;