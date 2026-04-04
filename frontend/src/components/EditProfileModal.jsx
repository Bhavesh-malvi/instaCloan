import React, { useState, useEffect, useContext, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { AppContext } from '../context/AppContext';
import API from '../api/axios';
import avatar from '../assets/img/avatar.png';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { userData, isAuth, handleLogout } = useContext(AppContext);
  // Need to get getProfile function from Context, but it wasn't exported in AppContext.jsx! 
  // Wait, I should just refresh the page or I will export `getProfile` next.
  // Actually, I can just reload the window if we don't have getProfile, but exporting getProfile is better.
  // Let me just assume we will reload window initially or add getProfile to Context.
  
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    bio: '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullname: userData.fullname || '',
        username: userData.username || '',
        bio: userData.bio || '',
      });
      setProfilePicPreview(userData.profilePic || avatar);
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('fullname', formData.fullname);
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      if (profilePicFile) {
        data.append('profilePic', profilePicFile);
      }

      const response = await API.put('/user/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        // We conventionally should call getProfile, but reload for immediate propagation is a safe fallback
        window.location.reload(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <AiOutlineClose size={24} className="cursor-pointer text-gray-500 hover:text-gray-900" onClick={onClose} />
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`text-blue-500 font-semibold text-sm hover:text-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto w-full scrollbar-hide">
          <div className="flex flex-col gap-6">
            
            {/* Error Banner */}
            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Avatar Change */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <img 
                src={profilePicPreview} 
                alt="Profile Setup" 
                className="w-14 h-14 rounded-full object-cover object-top border border-gray-200 bg-white"
              />
              <div className="flex flex-col">
                 <span className="font-semibold text-sm text-gray-900">{userData?.username}</span>
                 <button 
                   onClick={() => fileInputRef.current.click()}
                   className="text-blue-500 font-semibold text-[13px] hover:text-blue-700 w-max"
                 >
                   Change profile photo
                 </button>
                 <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef}
                   onChange={handleFileChange}
                 />
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-gray-800 ml-1">Name</label>
                <input 
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm placeholder-gray-400"
                />
              </div>
              
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-gray-800 ml-1">Username</label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm placeholder-gray-400"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-gray-800 ml-1">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  className="w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm placeholder-gray-400 min-h-[100px] resize-y"
                  maxLength={150}
                />
                <span className="text-gray-400 text-xs text-right mt-1">{formData.bio.length} / 150</span>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EditProfileModal;
