import axios from 'axios'
import  { useCallback, useState } from 'react'
import { RiCloseLargeFill } from 'react-icons/ri'

const LoginRegister = ({ hidelogin }) => {
    const [open, setOpen] = useState(false) // false = Login, true = Register
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const input = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        
        setData({
            ...data,
            [name]: value
        })
        
        // Clear error when user starts typing
        setError('')
    }

    // Login function
    const login =useCallback( async () => {
        try {
            setLoading(true)
            setError('')
            
            const response = await axios.post("http://localhost:5000/api/login", {
                email: data.email,
                password: data.password
            })
            
            console.log("Login Success:", response.data)
            
            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
            }
            
            // Close modal and redirect
            hidelogin(false)
            window.location.href = '/dashboard' // or your desired page
            
        } catch (error) {
            console.log("Login Error:", error.response?.data)
            setError(error.response?.data?.message || "Login failed! Please check your credentials")
        } finally {
            setLoading(false)
        }
    } ,[data.email,data.password ])

    // Register function
    const register = useCallback( async () => {
        try {
            setLoading(true)
            setError('')
            
            // Validation
            if (!data.name || !data.email || !data.password) {
                setError("All fields are required!")
                return
            }
            
            if (data.password.length < 6) {
                setError("Password must be at least 6 characters!")
                return
            }
            
            const response = await axios.post("http://localhost:5000/api/register", {
                name: data.name,
                email: data.email,
                password: data.password
            })
            
            console.log("Register Success:", response)
            
            // After successful registration, switch to login
            alert("Registration successful! Please login.")
            setOpen(false) // Switch to login mode
            setData({ name: "", email: "", password: "" }) // Clear form
            setError('')
            
            
            
        } catch (error) {
            console.log("Register Error:", error.response?.data)
            setError(error.response?.data?.error || "Registration failed! Email might already exist")
            console.log(error.message);
            
            
            
        } finally {
            setLoading(false)
        }
    },[data.name,data.email,data.password])

    const handleSubmit = () => {
        if (open) {
            register()
        } else {
            login()
        }
    }

    return (
        <div>
            <div className='backdrop:blur-md inset-0 bg-black/75 fixed'>
                <div className='backdrop-blur-md z-50 germania-one-regular rounded shadow-lg shadow-black hover:scale-105 duration-300 trang bg-orange-600 p-10 m-20 mt-1'>
                    <div className='flex flex-col gap-5 justify-center items-center'>
                        
                        <span onClick={() => hidelogin(false)} className='text-3xl text-slate-600 cursor-pointer'>
                            <RiCloseLargeFill />
                        </span>
                        
                        <h1>
                            <span className='text-3xl text-blue-950'>{open ? "REGISTER" : "LOGIN"}</span>
                        </h1>
                        
                        {/* Error message */}
                        {error && (
                            <div className='bg-red-500 text-white p-2 rounded text-center w-full'>
                                {error}
                            </div>
                        )}
                        
                        {/* Name field - only for register */}
                        {open && (
                            <span>
                                <span className='text-2xl'>Name:</span>
                                <input 
                                    type="text" 
                                    name='name' 
                                    className='rounded outline-none ml-2 p-1' 
                                    value={data.name} 
                                    onChange={input} 
                                    placeholder='Enter Your Name' 
                                />
                            </span>
                        )}
                        
                        {/* Email field */}
                        <span>
                            <span className='text-2xl'>Email:</span>
                            <input 
                                type="email" 
                                onChange={input} 
                                className='rounded outline-none ml-2 p-1' 
                                name='email' 
                                value={data.email} 
                                placeholder='Enter Your Email' 
                            />
                        </span>
                        
                        {/* Password field */}
                        <span>
                            <span className='text-2xl'>Password:</span>
                            <input 
                                type="password" 
                                className='rounded outline-none ml-2 p-1' 
                                name='password' 
                                value={data.password} 
                                onChange={input} 
                                placeholder='Enter Your Password' 
                            />
                        </span>
                        
                        {/* Submit Button */}
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className='shadow-md active:bg-orange-300 shadow-black text-2xl bg-fuchsia-800 text-white p-4 rounded disabled:opacity-50'
                        >
                            {loading ? "Processing..." : (open ? "Register" : "Login")}
                        </button>
                        
                        {/* Toggle between Login and Register */}
                        <span className='text-blue-100 cursor-pointer'>
                            <span 
                                className='hover:text-orange-300' 
                                onClick={() => {
                                    setOpen(true)
                                    setError('')
                                    setData({ name: "", email: "", password: "" })
                                }}
                            >
                                Create an Account
                            </span>
                            {!open && "?"}
                            {open && (
                                <span 
                                    className='hover:text-gray-500 ml-2' 
                                    onClick={() => {
                                        setOpen(false)
                                        setError('')
                                        setData({ name: "", email: "", password: "" })
                                    }}
                                >
                                    Login Now
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginRegister