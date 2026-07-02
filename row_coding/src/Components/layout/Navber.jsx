import  {  useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
} from 'react-icons/fi';

import { useCart } from '../../context/CartContext';




const Navbar = ({ hidelogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState('Home');

  const { cartCount } = useCart();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Electronics', path: '/products?category=electronics' },
    { name: 'Fashion', path: '/products?category=fashion' },
    { name: 'Contact', path: '/contact' },
    {name:'Test', path:"/test"}
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-indigo-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-4">

          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="text-3xl font-bold text-sky-400 germania-one-regular"
            >
              ShopNow
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setActive(item.name)}
                    className={`hover:text-orange-400 duration-300 ${
                      active === item.name
                        ? 'border-b-2 border-orange-400 pb-1'
                        : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-white text-black outline-none w-64"
                />

                <FiSearch className=" absolute left-3 top-3 text-gray-500" />
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <FiShoppingCart className="text-2xl hover:text-orange-400 duration-300" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Login Button */}
              <button
                onClick={() => hidelogin(true)}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg duration-300"
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-3xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-black/90 backdrop-blur-md text-white z-50 transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">

          <h1 className="text-3xl font-bold text-sky-400">
            ShopNow
          </h1>

          <button onClick={() => setIsOpen(false)}>
            <FiX className="text-3xl" />
          </button>

        </div>

        {/* Search */}
        <div className="p-4 relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 rounded-lg text-black outline-none"
          />

          <FiSearch className="absolute left-7 top-8 text-gray-500" />
        </div>

        {/* Mobile Menu */}
        <ul className="mt-4">

          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={() => {
                  setActive(item.name);
                  setIsOpen(false);
                }}
                className={`block px-6 py-4 text-xl hover:bg-white/10 hover:text-orange-400 duration-300 ${
                  active === item.name
                    ? 'bg-white/10 text-orange-400'
                    : ''
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}

        </ul>

        {/* Cart */}
        <div className="px-6 mt-6">
          <Link
            to="/cart"
            className="flex items-center gap-3 text-2xl"
          >
            <FiShoppingCart />

            Cart ({cartCount})
          </Link>
        </div>

        {/* Login */}
        <div className="px-6 mt-6">
          <button
            onClick={() => hidelogin(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg text-xl duration-300"
          >
            Login Now
          </button>
        </div>

      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;