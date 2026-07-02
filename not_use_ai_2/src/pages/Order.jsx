import React,{useEffect, useState} from 'react'
import { useContext } from 'react'
import { userContext } from '../context/UserContext'
const Order = () => {
    const {totalamount,grandTotal,placeOrder}=useContext(userContext)
      const [text, setText] = useState("");

  const fillInput = () => {
    setText("Hello Bangladesh");
  };

    useEffect(()=>{
        setText(grandTotal)
    },[grandTotal])
    

  return (
<div>
            <h1>Order Summary</h1>
            <p>Total Items Cost: {totalamount} TK</p>
            <p>Final Bill: {grandTotal} TK</p>

            {/* কন্ট্রোলড ইনপুট ফিল্ড */}
            <input 
                type="text" 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                style={{ padding: '10px', width: '200px' }}
            />

            <br /><br />
            <button onClick={() => setText("Hello Bangladesh")}>Fill Text</button>
            <button onClick={() => setText(grandTotal)}>Reset to Bill</button>
            <button onClick={() => placeOrder({ street: "123 Main St", city: "Dhaka" })}>Place Order</button>
        </div>
  )
}

export default Order
