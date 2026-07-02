// API কল করার জন্য সার্ভিস
const API_URL = 'http://localhost:5000/api/upload';

export const uploadService = {
  // সিঙ্গেল ফাইল আপলোড
  async uploadSingle(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/single`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  },
  // সব ফাইল পাওয়া
async getAllFiles() {
  const response = await fetch('http://localhost:5000/api/upload/files');
  return response.json();
},
  
  // মাল্টিপল ফাইল আপলোড
  async uploadMultiple(files) {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch(`${API_URL}/multiple`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
};