// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from './../../context/CartContext';

const ProductCard = ({ product }) => {
  const { dispatch, cart } = useCart();
  const isInCart = cart.some(item => item.id === product.id);

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <span className="text-sm text-blue-600 font-semibold">
            {product.category}
          </span>
          <h3 className="text-lg font-semibold mt-1">{product.name}</h3>
          
          <div className="flex items-center mt-2">
            <FiStar className="text-yellow-400 fill-current" />
            <span className="ml-1 text-sm">{product.rating}</span>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-xl font-bold">₹{product.price}</span>
            <button
              onClick={addToCart}
              disabled={isInCart}
              className={`p-2 rounded-full ${
                isInCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FiShoppingCart />
            </button>
          </div>

          {product.stock < 10 && (
            <p className="text-red-500 text-sm mt-2">
              Only {product.stock} left in stock!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;