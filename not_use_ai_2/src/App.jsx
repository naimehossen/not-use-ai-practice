import React, { useState, useContext, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { userContext } from './context/UserContext'

// কম্পোনেন্ট ইমপোর্ট
import Header from './components/Header'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import LoginPopup from './components/LoginPopup'

// আপনার ৬টি পেজ ইমপোর্ট
import Home from './pages/Home'
import Profile from './pages/Profile'
import Contack from './pages/Contack'
import Partice from './pages/partice'
import Order from './pages/Order'
import Verify from './pages/Verify'


const App = () => {
  const { token, setToken } = useContext(userContext);

  // রিফ্রেশ দিলেও যেন লগইন থাকে তার জন্য চেক
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, [setToken]);


  
  
  
  

  return (
    <>
      {/* যদি টোকেন না থাকে, তবে শুধু লগইন পপআপ দেখাবে */}
      {!token ? (
        <LoginPopup />
      ) : (
        <div className="app">
          {/* লগইন থাকলেই এই অংশগুলো লোড হবে */}
          <Header />
          <Navbar />
          
          <main className="min-h-[80vh] container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path='/contact' element={<Contack />} />
              <Route path='/partice' element={<Partice />} />
              <Route path='/order' element={<Order />} />
              <Route path='/verify' element={<Verify />} />
            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </>
  )
}

export default App