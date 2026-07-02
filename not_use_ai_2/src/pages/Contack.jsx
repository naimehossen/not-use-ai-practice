import React, { useContext, useState } from 'react'
import axios from 'axios';

const Contack = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // POST new user
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:5000/api/vpn/partice', formData);
            console.log(response.data);
            
            if (response.data.success) {
                setSuccess(true);
                setMessage('ইউজার রেজিস্টার সফল হয়েছে!');
                setFormData({ name: '', email: '', password: '' });
                
                // ২ সেকেন্ড পর message মুছে যাবে
                setTimeout(() => {
                    setMessage('');
                    setSuccess(false);
                }, 3000);
            }
        } catch (error) {
            setSuccess(false);
            setMessage(error.response?.data?.message || 'Error occurred');
        }
    };

    return (
         <div>
            <h2>নতুন ইউজার রেজিস্টার</h2>
            
            {message && (
                <div style={{ color: success ? 'green' : 'red' }}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="নাম"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <br />
                <input
                    type="email"
                    name="email"
                    placeholder="ইমেইল"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <br />
                <input
                    type="password"
                    name="password"
                    placeholder="পাসওয়ার্ড"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <br />
                <button type="submit">রেজিস্টার করুন</button>
            </form>
        </div>
    )
}

export default Contack