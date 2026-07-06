// src/pages/ProductDetail.jsx

import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { products } from '../data/products';
import { useCart } from './../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { dispatch, cart } = useCart();
  
  const product = products.find(p => p.id === Number(id));
  const isInCart = cart.some(item => item.id === product?.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Product not found</h2>
          <Link to="/products" className="text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products.filter(
    p => p.category === product.category && p.id !== product.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link 
        to="/products" 
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
      >
        <FiArrowLeft /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <span className="text-blue-600 font-semibold">{product.category}</span>
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i}
                  className={i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-gray-600">({product.rating})</span>
          </div>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mt-4">{product.description}</p>

          <div className="mt-4">
            <span className={`font-semibold ${
              product.stock > 10 ? 'text-green-600' : 
              product.stock > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {product.stock > 10 
                ? 'In Stock' 
                : product.stock > 0 
                  ? `Only ${product.stock} left` 
                  : 'Out of Stock'
              }
            </span>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
              disabled={isInCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold ${
                isInCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FiShoppingCart />
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
            
            <Link
              to="/cart"
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 text-center"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map(product => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="font-semibold mt-2">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-1">₹{product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;