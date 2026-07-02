import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userContext } from '../context/UserContext';
import axios from 'axios';
import Profile from './Profile';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url,users,handleUpdate,handleDelete } = useContext(userContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        const response = await axios.post(url + "/api/user/verify", { success, orderId });
        if (response.data.success) {
            navigate("/myorders"); // পেমেন্ট সফল হলে মাই অর্ডার পেজে যাবে
        } else {
            navigate("/"); // পেমেন্ট ফেইল করলে হোম পেজে ফেরত যাবে
        }
    };

    useEffect(() => {
        verifyPayment();
    }, []);

    return (
        <div className='verify'>
            <div className="spinner"> verify</div> {/* এখানে একটি লোডিং এনিমেশন দিতে পারেন */}
                {users.map(user => (
                <Profile 
                    key={user._id}
                    user={user}           // ← শুধু user object
                    onUpdate={handleUpdate}  // ← update function
                    onDelete={handleDelete}  // ← delete function
                />
            ))}
        </div>
    );
};

export default Verify;