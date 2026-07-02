import React from 'react'
import Navber from './Components/Navber'
import Footer from './Components/Footer'
import { Route, Routes } from 'react-router-dom'
import Home from './Page/Home'
import Card from './Page/Card'

const App = () => {
  return (
    <div>
    <Navber />
      <div>

    
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/cart' element={<Card/>}/>
          </Routes>

     {      /*  <Home />  */}
          

      </div>


      <Footer/>
    </div>
  )
}

export default App
