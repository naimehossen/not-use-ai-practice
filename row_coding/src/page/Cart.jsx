// src/pages/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, dispatch, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <Link 
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Shopping Cart</h2>
      
      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow flex gap-4">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">{item.category}</p>
                <p className="text-xl font-bold mt-2">₹{item.price}</p>
                
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        dispatch({
                          type: 'UPDATE_QUANTITY',
                          payload: { id: item.id, quantity: item.quantity - 1 }
                        });
                      }
                    }}
                    className="p-1 border rounded"
                  >
                    <FiMinus />
                  </button>
                  
                  <span className="font-semibold">{item.quantity}</span>
                  
                  <button
                    onClick={() => dispatch({
                      type: 'UPDATE_QUANTITY',
                      payload: { id: item.id, quantity: item.quantity + 1 }
                    })}
                    className="p-1 border rounded"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold">
                  ₹{item.price * item.quantity}
                </p>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                  className="text-red-500 mt-2"
                >
                  <FiTrash2 className="text-xl" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cartTotal > 2000 ? 'Free' : '₹100'}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₹{cartTotal > 2000 ? cartTotal : cartTotal + 100}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg mt-6 hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
            
            <button
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="block w-full text-center text-red-500 mt-3"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;