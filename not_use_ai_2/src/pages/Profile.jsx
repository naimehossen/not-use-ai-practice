import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Prrofile from '../components/Prrofile';
const Profile = () => {

     const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [editingId, setEditingId] = useState(null);

    const API_BASE = 'http://localhost:5000/api/vpn/partice';

    // ---- GET (লিস্ট দেখানো) ----
    const fetchUsers = async () => {
        try {
            const res = await axios.get(API_BASE);
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ---- ইনপুট হ্যান্ডেল ----
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ---- POST (Create) / PUT (Update) ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // ---- UPDATE (PUT) - ইমেইল ও পাসওয়ার্ড সহ ----
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    ...(formData.password && { password: formData.password }) // পাসওয়ার্ড থাকলে পাঠাবে, না থাকলে বাদ দেবে
                };
                
                const res = await axios.put(`${API_BASE}/${editingId}`, updateData);
                if (res.data.success) {
                    alert('Updated successfully!');
                    setEditingId(null);
                }
            } else {
                // ---- CREATE (POST) ----
                const res = await axios.post(API_BASE, formData);
                if (res.data.success) {
                    alert('Created successfully!');
                }
            }
            setFormData({ name: '', email: '', password: '' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed!');
        }
    };

    // ---- EDIT (ফর্মে ডাটা বসানো) ----
    const handleEdit = (user) => {
        setEditingId(user._id);
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: '' // পাসওয়ার্ড ফাঁকা দেখাবে (সিকিউরিটি কারণে)
        });
    };

    // ---- DELETE ----
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        
        try {
            const res = await axios.delete(`${API_BASE}/${id}`);
            if (res.data.success) {
                alert('Deleted!');
                fetchUsers();
            }
        } catch (error) {
            alert('Delete failed!');
        }
    };

    

    const [l,l1]=useState({emaill:"",passwordd:""})


    const onLOginnnn=(e)=>{

        const {name,value}=e.target;

        l1(pre=>({
            ...pre,
            [name]:value
        }))

    }
    
    

    const onLogin=async(e)=>{
        

                e.preventDefault();
            try {
            const res=await axios.post(`${API_BASE}/login`,l )
            if (res.data) {
                console.log(res.data);
                alert(res.data.message)
            }
            } catch (error) {
                alert("error")
            }
                    
                    
    }

    useEffect(()=>{
        onLogin();
    },[])

    //////////////////////////

      const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // সংখ্যা ইনপুট নেওয়া
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  // দশমিক যোগ করা
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // ক্লিয়ার বাটন
  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // অপারেশন সেট করা
  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // গণনা করা
  const calculate = (first, second, op) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return first / second;
      default: return second;
    }
  };

  // সমান (=) বাটন
  const evaluate = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  // পরিবর্তন চিহ্ন (+/-)
  const toggleSign = () => {
    const newValue = parseFloat(display) * -1;
    setDisplay(String(newValue));
  };

  // পার্সেন্টেজ
  const percent = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  // বাটনের স্টাইল
  const buttonClass = "w-16 h-16 m-1 rounded-full text-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95";
  



  return (
    <div>
      <Prrofile/>
    <div style={{ padding: '20px' } } className=''>
            <h2>{editingId ? 'Update User (Email & Password editable)' : 'Add New User'}</h2>
            
            {/* ----- ফর্ম (POST/PUT) ----- */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        // 🔥 disabled সরিয়ে দিয়েছি - এখন আপডেট করা যাবে
                    />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder={editingId ? "New Password (optional)" : "Password"}
                        value={formData.password}
                        onChange={handleChange}
                        required={!editingId} // Create এর সময় required, Update এর সময় optional
                        style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                    />
                    {editingId && (
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Leave blank to keep current password
                        </small>
                    )}
                </div>
                
                <button type="submit" style={{ padding: '8px 16px', marginRight: '10px' }}>
                    {editingId ? 'Update' : 'Create'}
                </button>
                
                {editingId && (
                    <button 
                        type="button" 
                        onClick={() => { 
                            setEditingId(null); 
                            setFormData({ name: '', email: '', password: '' }); 
                        }}
                        style={{ padding: '8px 16px' }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {/* ----- ইউজার লিস্ট ও বাটন ----- */}
            <h3>User List</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map((user) => (
                    <li key={user._id} style={{ 
                        marginBottom: '15px', 
                        padding: '10px', 
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <strong>{user.name}</strong> 
                            <span style={{ marginLeft: '10px', color: '#666' }}>({user.email})</span>
                        </div>
                        <div >
                            <button 
                                onClick={() => handleEdit(user)} 
                                style={{ marginRight: '10px', padding: '5px 10px' }}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(user._id)} 
                                style={{ 
                                    padding: '5px 10px', 
                                    background: '#ff4444', 
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div >
                {users.map((user)=>{
                      return   <li>{user.password}</li>
                })}
            </div>

            <div>
                <form action="" onSubmit={onLogin}>
                    <input type="email" name="emaill" placeholder='email' value={l.emaill} onChange={onLOginnnn} id="" />
                    <input type="password" name="passwordd" placeholder='password' value={l.passwordd} onChange={onLOginnnn} id="" />
                    <button type="submit">Login</button>
                </form>
            </div>


        </div>
        
        
        <div>

            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-80">
        {/* ডিসপ্লে স্ক্রিন */}
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          <div className="text-right">
            <div className="text-gray-400 text-sm h-6">
              {previousValue !== null && `${previousValue} ${operation}`}
            </div>
            <div className="text-white text-4xl font-mono font-bold break-words">
              {display}
            </div>
          </div>
        </div>

        {/* বাটন গ্রিড */}
        <div className="grid grid-cols-4 gap-1">
          {/* প্রথম সারি */}
          <button 
            onClick={clearDisplay}
            className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white`}
          >
            AC
          </button>
          <button 
            onClick={toggleSign}
            className={`${buttonClass} bg-gray-600 hover:bg-gray-700 text-white`}
          >
            +/-
          </button>
          <button 
            onClick={percent}
            className={`${buttonClass} bg-gray-600 hover:bg-gray-700 text-white`}
          >
            %
          </button>
          <button 
            onClick={() => performOperation('÷')}
            className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white text-2xl`}
          >
            ÷
          </button>

          {/* দ্বিতীয় সারি */}
          <button 
            onClick={() => inputDigit(7)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            7
          </button>
          <button 
            onClick={() => inputDigit(8)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            8
          </button>
          <button 
            onClick={() => inputDigit(9)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            9
          </button>
          <button 
            onClick={() => performOperation('×')}
            className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white text-2xl`}
          >
            ×
          </button>

          {/* তৃতীয় সারি */}
          <button 
            onClick={() => inputDigit(4)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            4
          </button>
          <button 
            onClick={() => inputDigit(5)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            5
          </button>
          <button 
            onClick={() => inputDigit(6)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            6
          </button>
          <button 
            onClick={() => performOperation('-')}
            className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white text-2xl`}
          >
            -
          </button>

          {/* চতুর্থ সারি */}
          <button 
            onClick={() => inputDigit(1)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            1
          </button>
          <button 
            onClick={() => inputDigit(2)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            2
          </button>
          <button 
            onClick={() => inputDigit(3)}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            3
          </button>
          <button 
            onClick={() => performOperation('+')}
            className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white text-2xl`}
          >
            +
          </button>

          {/* পঞ্চম সারি */}
          <button 
            onClick={() => inputDigit(0)}
            className={`${buttonClass} w-34 bg-gray-700 hover:bg-gray-600 text-white col-span-2`}
          >
            0
          </button>
          <button 
            onClick={inputDecimal}
            className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
          >
            .
          </button>
          <button 
            onClick={evaluate}
            className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white text-2xl`}
          >
            =
          </button>
        </div>

        {/* ডেভেলপার ক্রেডিট */}
        <div className="text-center text-gray-500 text-xs mt-4">
          তৈরি করা হয়েছে React & Tailwind CSS দিয়ে
        </div>
      </div>
    </div>
        </div>
        </div>


  )
}

export default Profile
