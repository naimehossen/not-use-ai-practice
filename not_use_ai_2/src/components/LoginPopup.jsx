import axios from 'axios';
import React, { useContext,  useState } from 'react'

import { userContext } from '../context/UserContext';
//import {jwtdecoded} from 'jwt-decode'

const LoginPopup = () => {

    const [state,setState]=useState("Login");
    const{token,setToken}=useContext(userContext);

    

    
    

    const [data,setData]=useState({
        name:"",
        email:"",
        password:""
        })
    //const decode=jwtdecoded(token)
    //console.log(decode);
    
    const fromonSubmit= async (e)=>{
        e.preventDefault();

        let response;


        try {
            if (state==="Login") {
                response =await axios.post("http://localhost:5000/api/vpn/partice/login",data)
            } else {
                response =await axios.post("http://localhost:5000/api/vpn/particeregister",data)
            }
            
            console.log(response);
            
            if (response.data.success) {
                console.log(response.data);
                localStorage.setItem("token",response.data.token)
                setToken(response.data.token)
                
            }

            if (response.data.register) {
                alert("pls LOgin")
                setState("Login")
            }

            if (response.data.password) {
            alert("place valid password")
            }

            if (response.data.messageerr) {
                alert("pleace type email or password")
            }
        } catch (error) {
            
        }


    }

    const onchageetarget=(e)=>{

        const {name,value}=e.target;

        setData(prev=>({
            ...prev,
            [name]:value
        }))

    }

    
    

   

  return (
    <div>
        <form action="" onSubmit={fromonSubmit}>
    {state!=="Login" && ( <input type="text" value={data.name} onChange={onchageetarget}  name="name" placeholder='name' id="" /> ) } <br />
    <input type="text" name="email" value={data.email} onChange={onchageetarget}placeholder='email' id="" /> <br />
    <input type="text" name="password" value={data.password} onChange={onchageetarget}  placeholder='password' id="" /> <br />
    <button type="submit">{state==="Login"?"Login":"Create Account"}</button> <br />
    <span onClick={()=>setState("create account") } className='cursor-pointer hover:bg-red-500 hover:text-white'>create a account</span>{" "}
    <span onClick={()=>setState("Login")} className='cursor-pointer hover:bg-red-500 hover:text-white'>Login here</span>
        </form>

        {state==="Login"&& (
            <div  >
                <h1>Register success full</h1>
                <p></p>
                <h1>NOW LOGIN</h1>
            </div>
        )}
    </div>
  )
}

export default LoginPopup
