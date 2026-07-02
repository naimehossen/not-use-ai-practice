import { createContext, useState, useEffect, useMemo } from "react";
import axios from 'axios';

export const userContext = createContext();

export const Naime = ({ children }) => {
    // ১. প্রয়োজনীয় স্টেটসমূহ
    const url = "http://localhost:5000";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([
        { _id: "yerwiywehjhfdsjkhfkshjfh98jfhds", name: "Burger", price: 1 },
        { _id: "5", name: "Pizza", price: 4 },
        { _id: "8", name: "Salad", price: 3 }
    ]);

    // কার্ট আইটেম কাউন্ট স্টেট (LocalStorage থেকে লোড হবে)
    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem("count");
        // JSON.parse করার সময় ডাটা ভ্যালিড কি না চেক করা ভালো
        try {
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    // ২. ডাটাবেস থেকে খাবারের লিস্ট নিয়ে আসা
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/vpn/list");
            if (response.data.success) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching food list:", error);
        }
    };

    // ৩. ইউজারের টোকেন এবং ডাটা লোড করা
    useEffect(() => {
        async function loadData() {
            // await fetchFoodList(); // সার্ভার কানেক্ট থাকলে আন-কমেন্ট করুন
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
            }
        }
        loadData();
    }, []);

    // ৪. কার্ট লজিক
    const Broan = (id) => {
        setCount(prev => ({ ...prev, [id]: prev[id] ? prev[id] + 1 : 1 }));
    };

    const koman = (id) => {
        setCount(prev => ({ ...prev, [id]: prev[id] > 0 ? prev[id] - 1 : 0 }));
    };

    const removefromcart = (id) => {
        setCount(prev => {
            const newCount = { ...prev };
            delete newCount[id];
            return newCount;
        });
    };

    // কার্ট আপডেট হলে LocalStorage-এ সেভ করা
    useEffect(() => {
        localStorage.setItem("count", JSON.stringify(count));
    }, [count]);

    // ৫. ক্যালকুলেশন (useMemo)
    const totalamount = useMemo(() => {
        return food_list.reduce((acc, item) => {
            const qty = count[item._id] || 0;
            return acc + (item.price * qty);
        }, 0);
    }, [count, food_list]);

    const deliveryFee = totalamount > 0 ? 2 : 0; 
    const discount = totalamount > 500 ? (totalamount * 0.1) : 0; 
    const grandTotal = totalamount + deliveryFee - discount;

    // ৬. পেমেন্ট এবং অর্ডার লজিক
    const placeOrder = async (addressData) => {
        try {
            let orderItems = [];
            food_list.forEach((item) => {
                if (count[item._id] > 0) {
                    let itemInfo = { ...item, quantity: count[item._id] };
                    orderItems.push(itemInfo);
                }
            });

            let orderData = {
                address: addressData,
                items: orderItems,
                amount: grandTotal,
            };

            const response = await axios.post(url + "/api/vpn/place", orderData, { headers: { token } });

            if (response.data.success) {
                const { session_url } = response.data;
                window.location.replace(session_url);
            } else {
                alert("অর্ডারে সমস্যা হয়েছে!");
            }
        } catch (error) {
            console.log("Order Error:", error);
            alert("সার্ভারে সমস্যা হয়েছে!");
        }
    };

        
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
          const [error, setError] = useState(null);

             // Delete handler
    const handleDelete = (userId) => {
        setUsers(users.filter(user => user._id !== userId));
    };


        // GET all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/vpn/partice');
            
            
            // ✅ সঠিক: newUser এ array আছে
            setUsers(response.data.users || []);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


      const handleUpdate = () => {
        fetchUsers(); // রিফ্রেশ লিস্ট
    };


    // ৭. সব ভ্যালু প্রোভাইড করা
    const contextValue = {
        handleUpdate,
        handleDelete,
        error,
        setError,
        loading,
        setLoading,
        users,
        setUsers,
        fetchUsers,
        url,
        token,
        setToken,
        food_list,
        count,
        setCount,
        totalamount,
        deliveryFee,
        discount,
        grandTotal,
        Broan,
        koman,
        removefromcart,
        placeOrder
    };

    return (
        <userContext.Provider value={contextValue}>
            {children}
        </userContext.Provider>
    );
};