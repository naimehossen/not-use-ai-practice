import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

// ✅ আপনার দেওয়া হুবহু সঠিক পাথ ব্যবহার করে স্ট্যান্ডার্ড Lazy Import:
const Home = lazy(() => import("./page/Home"));
const Contact = lazy(() => import("./page/Contact"));
const C = lazy(() => import("./page/Contact"));
const Navbar = lazy(() => import("./Components/layout/Navber")); // আপনার সঠিক পাথ 'Navber'
const Products = lazy(() => import("./page/Products"));
const Cart = lazy(() => import("./page/Cart"));
const ProductDetail = lazy(() => import("./page/ProductDetail"));
const Notfound = lazy(() => import("./page/Notfound"));
const Footer = lazy(() => import("./Components/layout/Footer"));
const Test = lazy(() => import("./page/Test"));

// 🎨 Better Suspense Fallback Components
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="relative">
      {/* Outer ring */}
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      {/* Inner dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
    </div>
    <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading...</p>
    <p className="text-xs text-gray-400 mt-1">Please wait</p>
  </div>
);

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border px-6 py-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <span className="text-sm font-medium text-gray-600">Loading component...</span>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="p-6 space-y-4 animate-pulse">
    {/* Header skeleton */}
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    {/* Content skeleton */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
    {/* Card skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

// 🔄 Progress Bar Loader
const ProgressLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="w-48 space-y-3">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Loading...</span>
        <span>Please wait</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  </div>
);

// 🎯 Main App
export const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 bg-white border-b animate-pulse" />}>
        <Navbar />
      </Suspense>

      {/* Main Content with Suspense */}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/c" element={<C />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </Suspense>
      </main>

      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  );
};
