// pages/Contact.jsx
import { useState } from 'react';
import { FiSend, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'নাম আবশ্যক';
    if (!formData.email.trim()) newErrors.email = 'ইমেইল আবশ্যক';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'সঠিক ইমেইল দিন';
    if (!formData.message.trim()) newErrors.message = 'মেসেজ লিখুন';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      // API Call (তোর Backend-এ পাঠাবে)
      // await api.post('/contact', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-slate-900 py-16'>
      <div className='max-w-7xl mx-auto px-4'>
        
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
            যোগাযোগ করুন
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            আপনার যেকোনো প্রশ্ন, পরামর্শ বা মতামত জানাতে পারেন
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          
          {/* Contact Info Cards */}
          <div className='space-y-6'>
            <Card hover={false} className='text-center'>
              <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiPhone className='text-2xl text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className='font-bold text-lg mb-2'>ফোন</h3>
              <p className='text-gray-600 dark:text-gray-400'>+880 1712-345678</p>
              <p className='text-gray-600 dark:text-gray-400'>+880 1912-345678</p>
            </Card>

            <Card hover={false} className='text-center'>
              <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiMail className='text-2xl text-green-600 dark:text-green-400' />
              </div>
              <h3 className='font-bold text-lg mb-2'>ইমেইল</h3>
              <p className='text-gray-600 dark:text-gray-400'>info@notai.com</p>
              <p className='text-gray-600 dark:text-gray-400'>support@notai.com</p>
            </Card>

            <Card hover={false} className='text-center'>
              <div className='w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiMapPin className='text-2xl text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='font-bold text-lg mb-2'>ঠিকানা</h3>
              <p className='text-gray-600 dark:text-gray-400'>
                বনানী, ঢাকা-1213<br />বাংলাদেশ
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className='lg:col-span-2'>
            <Card hover={false} padding='p-8'>
              {success ? (
                // Success Message
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>✅</div>
                  <h2 className='text-2xl font-bold text-green-600 mb-2'>মেসেজ পাঠানো হয়েছে!</h2>
                  <p className='text-gray-600 dark:text-gray-400'>আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
                  <Button 
                    variant='outline' 
                    className='mt-6'
                    onClick={() => setSuccess(false)}
                  >
                    নতুন মেসেজ লিখুন
                  </Button>
                </div>
              ) : (
                // Form
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Input
                      label='আপনার নাম'
                      name='name'
                      placeholder='আপনার নাম লিখুন'
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon='👤'
                    />
                    <Input
                      label='ইমেইল'
                      name='email'
                      type='email'
                      placeholder='example@mail.com'
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon='📧'
                    />
                  </div>

                  <Input
                    label='বিষয়'
                    name='subject'
                    placeholder='মেসেজের বিষয়'
                    value={formData.subject}
                    onChange={handleChange}
                    icon='📝'
                  />

                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      আপনার মেসেজ
                    </label>
                    <textarea
                      name='message'
                      rows='6'
                      placeholder='এখানে আপনার মেসেজ লিখুন...'
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-lg outline-none transition-all bg-transparent dark:text-white resize-none ${
                        errors.message 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 focus:border-blue-500'
                      }`}
                    />
                    {errors.message && (
                      <span className='text-red-500 text-xs'>{errors.message}</span>
                    )}
                  </div>

                  <Button 
                    type='submit'
                    variant='primary'
                    size='lg'
                    loading={loading}
                    className='w-full'
                  >
                    <span className='flex items-center justify-center gap-2'>
                      <FiSend /> মেসেজ পাঠান
                    </span>
                  </Button>
                </form>
              )}
            </Card>
          </div>

        </div>

        {/* Map Section */}
        <div className='mt-16'>
          <Card hover={false} padding='p-0' className='overflow-hidden'>
            <div className='bg-gray-300 dark:bg-slate-700 h-64 flex items-center justify-center'>
              <div className='text-center'>
                <FiMapPin className='text-5xl text-gray-500 dark:text-gray-400 mx-auto mb-2' />
                <p className='text-gray-600 dark:text-gray-400'>Google Maps Embed Here</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Contact;