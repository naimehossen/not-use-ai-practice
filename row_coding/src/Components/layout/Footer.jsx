// src/components/Footer.jsx

import { memo } from 'react';
import { Link } from 'react-router-dom';

const Footer=memo(()=>{ return (<footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ShopNow</h3>
            <p className="text-gray-400">
              Your one-stop shop for all your needs. Quality products at best prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products?category=Electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-white">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 support@shopnow.com</li>
              <li>📞 +880 1234-567890</li>
              <li>📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ShopNow. All rights reserved.</p>
        </div>
      </div>
    </footer>)})



export default Footer;