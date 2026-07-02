import React, { useState, useContext } from 'react';
import { userContext } from '../context/UserContext';
import axios from 'axios';

// ✅ Google Login imports
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

// ✅ Facebook Login import
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, token } = useContext(userContext);
    const [currState, setCurrState] = useState("Login"); 
    
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    // ইনপুট হ্যান্ডলার
    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    // ইমেইল-পাসওয়ার্ড লগইন ও রেজিস্ট্রেশন হ্যান্ডলার
    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;

        if (currState === "Login") {
            newUrl += "/api/vpn/login"; 
        } else {
            newUrl += "/api/vpn/register";
        }

        try {
            const response = await axios.post(newUrl, data);

            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setShowLogin(false);
                alert(`${currState} Successful!`);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Login Error:", error);
            alert("Error connecting to server!");
        }
    };

    // ✅ Facebook Login Handler
    const responseFacebook = async (fbResponse) => {
        if (fbResponse.accessToken) {
            try {
                const response = await axios.post(url + "/api/vpn/facebook-login", {
                    name: fbResponse.name,
                    email: fbResponse.email
                });

                if (response.data.success) {
                    setToken(response.data.token);
                    localStorage.setItem("token", response.data.token);
                    setShowLogin(false);
                    alert("Facebook Login Successful! 🚀");
                } else {
                    alert(response.data.message);
                }
            } catch (err) {
                console.log("Facebook Auth Error:", err);
                alert("Facebook Login Failed!");
            }
        }
    };

    return (
        <div className='login-popup fixed inset-0 z-[1000] bg-black bg-opacity-60 flex items-center justify-center p-4'>
            <form onSubmit={onLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fadeIn">
                
                {/* Close Button */}
                <button 
                    type="button"
                    onClick={() => setShowLogin(false)} 
                    className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800">{currState}</h2>
                    <p className="text-gray-500 text-sm mt-1">Please enter your details</p>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                    {currState !== "Login" && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 ml-1">Full Name</label>
                            <input
                                name='name'
                                onChange={onChangeHandler}
                                value={data.name}
                                type="text"
                                placeholder='Naime Hussain'
                                required
                                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">Email Address</label>
                        <input
                            name='email'
                            onChange={onChangeHandler}
                            value={data.email}
                            type="email"
                            placeholder='example@gmail.com'
                            required
                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
                        <input
                            name='password'
                            onChange={onChangeHandler}
                            value={data.password}
                            type="password"
                            placeholder='••••••••'
                            required
                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    type='submit'
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transform transition active:scale-95"
                >
                    {currState === "Sign Up" ? "Create Account" : "Login"}
                </button>

                {/* ✅ Social Login Section */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="flex items-center w-full gap-2">
                        <div className="h-[1px] bg-gray-200 grow"></div>
                        <span className="text-xs text-gray-400 uppercase">Or continue with</span>
                        <div className="h-[1px] bg-gray-200 grow"></div>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        {/* Google Login */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const decoded = jwtDecode(credentialResponse.credential);
                                        const response = await axios.post(
                                            url + "/api/vpn/google-login",
                                            {
                                                name: decoded.name,
                                                email: decoded.email
                                            }
                                        );

                                        if (response.data.success) {
                                            setToken(response.data.token);
                                            localStorage.setItem("token", response.data.token);
                                            setShowLogin(false);
                                            alert("Google Login Successful! 🚀");
                                        } else {
                                            alert(response.data.message);
                                        }
                                    } catch (err) {
                                        console.log("Google Auth Error:", err);
                                        alert("Google Login Failed! Google Login Successful! 🚀");
                                    }
                                }}
                                onError={() => alert("Google Login Failed!")}
                                theme="outline"
                                shape="pill"
                            />
                        </div>

                        {/* ✅ Facebook Login Button */}
                        <FacebookLogin
                            appId="2177532076392166" // আপনার Facebook App ID
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={responseFacebook}
                            render={renderProps => (
                                <button 
                                    type="button"
                                    onClick={renderProps.onClick}
                                    className="w-full bg-[#1877F2] text-white py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#166fe5] transition-all shadow-md active:scale-95 text-sm"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Continue with Facebook
                                </button>
                            )}
                        />
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {currState === "Login" ? (
                        <p>
                            New here?{" "}
                            <span
                                className="text-blue-600 font-bold cursor-pointer hover:underline"
                                onClick={() => setCurrState("Sign Up")}
                            >
                                Create a new account
                            </span>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <span
                                className="text-blue-600 font-bold cursor-pointer hover:underline"
                                onClick={() => setCurrState("Login")}
                            >
                                Login here
                            </span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginPopup;