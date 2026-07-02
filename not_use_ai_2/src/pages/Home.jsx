import axios from 'axios'
import React, { useEffect, useMemo, useRef } from 'react'
import { useState } from 'react'
import Par from '../components/par'

const Home = () => {

    const [darkMode, setDarkMode] = useState(false)
  
  // localStorage থেকে dark mode স্টেট লোড
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'
    setDarkMode(isDark)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  // টগল ফাংশন
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  

  const [data,setData]=useState({
    name:"",
    price:"",
    description:""
  })

  const [price,setPrice]=useState([]);



useEffect(()=>{
    const nnn=async()=>{
       const allgetdata= await axios.get("http://localhost:5000/api/vpn/gprice")
     setPrice(allgetdata.data.da);
    }

    nnn()
   
},[])




  const allSubmit=async(e)=>{
    e.preventDefault();

    try {
      const response=await axios.post("http://localhost:5000/api/vpn/price",data)
    

      console.log(response.data.allmodel);
     
      
      if (response.data.success) {
        setData({name:"",price:"",description:""})
      }
      
    } catch (error) {
      
    }
 

  }

  const jsondata=(e)=>{

    const {name,value}=e.target;

    setData(prev=>({
      ...prev,
      [name]:value
    }))

  }


  const [d,dt]=useState("")


const deatils=(id)=>{

  dt(id)



}

const [hisam,setHisab]=useState(() => {
        const saved = localStorage.getItem("count");
        // JSON.parse করার সময় ডাটা ভ্যালিড কি না চেক করা ভালো
        try {
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    })
//const [thisab,tsetHisab]=useState(0)
const baran=(id)=>{


  setHisab(prev=>({
    ...prev,
    [id]:prev[id]?prev[id]+1:1
  }))

}

const koman=(id)=>{
  
  setHisab(prev=>({
    ...prev,
    [id]:prev[id]>1?prev[id]-1:""
  }))
  

}









//const total=
//
//    price.reduce((aac,item)=>{
 //   const qty=hisam[item._id] || 0
 //   return aac+(item.price*qty);
//
 // },0)


const total=useMemo(()=>{

  return price.reduce((aac,item)=>{
    const qty=hisam[item._id] || 0
    return aac+(item.price*qty);

  },0)
},[hisam,price])

  const useref = useRef(null);
  const intervalRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false); // ট্র্যাক রাখার জন্য

  const focusInput = () => {
    useref.current.focus();
  };

  const startTimer = () => {
    // যদি ইতিমধ্যে interval চলে, তাহলে প্রথমে বন্ধ করো
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // নতুন interval শুরু করো
    intervalRef.current = setInterval(() => {
      console.log("টিক টিক", new Date().toLocaleTimeString());
    }, 1000);
    
    setIsRunning(true);
    console.log("✅ টাইমার স্টার্ট হয়েছে");
  };

  const stopTimer = () => {
    // চেক করো interval আসলেই আছে কিনা
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // গুরুত্বপূর্ণ: রেফারেন্স মুছে দাও
      setIsRunning(false);
      console.log("❌ টাইমার বন্ধ হয়েছে");
    } else {
      console.log("⚠️ কোনো টাইমার চলছে না");
    }
  };


  return (
    <div>

      <Par/>

      <div>
            <input type="text" ref={useref} />
      <button onClick={focusInput}>ফোকাস করুন</button>
      <br /><br />
      
      <button onClick={startTimer} disabled={isRunning}>
        স্টার্ট {isRunning && "(চলছে)"}
      </button>
      <button onClick={stopTimer} disabled={!isRunning}>
        স্টপ
      </button>
      
      <p>স্ট্যাটাস: {isRunning ? "🏃 টাইমার চলছে" : "⏹️ টাইমার বন্ধ"}</p>
      </div>



      <form action="" onSubmit={allSubmit}>
        <input type="text" placeholder='name'  value={data.name}  onChange={jsondata} name="name" id="" /> <br />
        <input type="text" placeholder='price'  value={data.price}  onChange={jsondata} name="price" id="" /> <br />
        <input type="text" placeholder='description'  value={data.description} onChange={jsondata} name="description" id="" />
        <button type="submit">submit</button>
      </form>

      <div>

        {price.map((item)=>{
        return <h1 key={item._id}>{item.name} <span onClick={()=>baran(item._id)}>বাড়ান
          </span> <span className='cursor-pointer' onClick={()=>deatils(item)}>details</span><span>{hisam[item._id]}</span> <span onClick={()=>koman(item._id)}>কমান</span><span>দামঃ{hisam[item._id]?hisam[item._id]*item.price:""}</span></h1> 

        })}

        <h1>total{total}</h1>

        <h1>{d.name}{d.price}-{d.description}</h1>
        
        {price.length}

        <br />

    
        
      </div>

      <div>
        <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors"
    >
      {darkMode ? (
        <span className="text-yellow-400">☀️ লাইট মোড</span>
      ) : (
        <span className="text-gray-800">🌙 ডার্ক মোড</span>
      )}
    </button>
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  <h1 className="text-gray-800 dark:text-gray-100">আমার টাইটেল</h1>
  <p className="text-gray-600 dark:text-gray-400">আমার বিবরণ</p>
</div>

<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-6">
  <h2 className="text-gray-800 dark:text-white font-bold">প্রোডাক্ট নাম</h2>
  <p className="text-gray-600 dark:text-gray-300">প্রোডাক্টের বিবরণ</p>
  <span className="text-blue-600 dark:text-blue-400">$99.99</span>
</div>
      </div>
    </div>
  )
}

export default Home
