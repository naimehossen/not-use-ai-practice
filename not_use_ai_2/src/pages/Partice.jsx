import React, { useMemo, useState } from 'react'
import { useContext } from 'react';
import { userContext } from '../context/UserContext';
const partice = () => {

    const { food_list, totalamount,count,setCount,koman,Broan,removefromcart,deliveryFee,discount,grandTotal } = useContext(userContext);
    

    console.log(count);
    
      


  return (
    <div>

      {food_list.map((item)=>(
      <li key={item._id}>
        {"নাম : "    +item.name} - {"দাম : "    +item.price} =
        <button onClick={()=>Broan(item._id)}>+</button>
        <span>{count[item._id]}</span> 
        
        <button onClick={()=>koman(item._id)}>-</button>
        
        {"মোট : "}{count[item._id]?item.price*count[item._id]:0}

        <button onClick={()=>removefromcart(item._id)}>Remove</button>
      </li>
      ))}
      <h1>সর্বমোট বিল :{totalamount}</h1>
      <p>খাবারের দাম: {totalamount} TK</p>
<p>ডেলিভারি চার্জ: {deliveryFee} TK</p>
<p>ডিসকাউন্ট: -{discount} TK</p>
<hr />
<h3>সর্বমোট বিল: {grandTotal} TK</h3>
    </div>
  )
}

export default partice
