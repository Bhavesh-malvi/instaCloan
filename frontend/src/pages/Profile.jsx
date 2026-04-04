import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FiSettings, FiHeart } from 'react-icons/fi';
import { BsGrid3X3, BsBookmark, BsPersonBoundingBox } from 'react-icons/bs';
import { BiMoviePlay } from "react-icons/bi";
import avatar from '../assets/img/avatar.png';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
  const { userData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('POSTS');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  console.log(userData);
  

  // Dummy Profile Data
  const profileData = {
    username: userData?.username || 'insta_user_123',
    fullname: userData?.fullname || 'Bhavesh Malviya',
    bio: userData?.bio || 'Dreamer & Developer 🚀\\nMERN Stack Enthusiast 💻\\nBuilding cool stuff! \\n📍 Udaipur, India',
    link: 'portfoliowebsite.com',
    avatar: userData?.profilePic || avatar,
    postsCount: 12,
    followersCount: userData?.followers?.length || 0,
    followingCount: userData?.following?.length || 0,
  };

  // Dummy Posts Grid Data
  const gridPosts = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    image: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?auto=format&fit=crop&w=400&q=80` // placeholder random style photos using ids, actually unsplash doesn't work like this reliably
  }));
  
  // Reliable grid images
  const reliableGridPosts = [
    "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542224566-6f3b0060098f?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531604250646-2f0e818c4e06?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop"
  ];

  const tabs = [
    { name: 'POSTS', icon: <BsGrid3X3 size={12} /> },
    { name: 'REELS', icon: <BiMoviePlay size={14} /> },
    { name: 'SAVED', icon: <BsBookmark size={12} /> },
    { name: 'TAGGED', icon: <BsPersonBoundingBox size={14} /> },
  ];

  return (
    <div className="w-full flex justify-center mt-6 lg:mt-10 mb-20">
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <div className="max-w-[935px] w-full px-4 sm:px-6">
        
        {/* PROFILE HEADER AREA */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-10 pb-10 border-b border-gray-200 w-full gap-8 md:gap-[100px]">
          
          {/* Avatar Area */}
          <div className="flex justify-center flex-shrink-0 w-full md:w-auto mt-2 md:pl-10">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-300">
              <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover object-top bg-white" />
            </div>
          </div>

          {/* User Info Area */}
          <div className="flex flex-col flex-1 w-full mt-4 md:mt-0">
            
            {/* Top row: Username & Actions */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <span className="text-[20px] text-gray-900 pr-5 leading-6">{profileData.username}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditModalOpen(true)} className="bg-[#efefef] hover:bg-[#dbdbdb] transition text-black font-semibold text-[14px] px-4 py-1.5 rounded-lg active:opacity-70">
                  Edit profile
                </button>
                <button className="bg-[#efefef] hover:bg-[#dbdbdb] transition text-black font-semibold text-[14px] px-4 py-1.5 rounded-lg active:opacity-70">
                  View archive
                </button>
                <FiSettings size={22} className="ml-2 cursor-pointer hover:opacity-70" />
              </div>
            </div>

            {/* Middle row: Stats */}
            <div className="flex items-center gap-8 mb-5">
              <p className="text-[16px] text-gray-900"><span className="font-semibold">{profileData.postsCount}</span> posts</p>
              <p className="text-[16px] text-gray-900 cursor-pointer"><span className="font-semibold">{profileData.followersCount}</span> followers</p>
              <p className="text-[16px] text-gray-900 cursor-pointer"><span className="font-semibold">{profileData.followingCount}</span> following</p>
            </div>

            {/* Bottom row: Bio */}
            <div>
              <p className="text-[14px] font-semibold text-gray-900 leading-5">{profileData.fullname}</p>
              <p className="text-[14px] text-gray-900 leading-[18px] whitespace-pre-wrap">{profileData.bio}</p>
              <a href="#" className="text-[14px] font-semibold text-[#00376b] hover:underline mt-1 block">
                {profileData.link}
              </a>
            </div>

          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center justify-center gap-12 w-full mt-2 border-t border-transparent relative -top-[1px]">
          {tabs.map((tab) => (
            <div 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-4 border-t cursor-pointer transition ${activeTab === tab.name ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {tab.icon}
              <span className="text-[12px] font-semibold tracking-widest">{tab.name}</span>
            </div>
          ))}
        </div>

        {/* PHOTO GRID (Only shown for 'POSTS' & 'SAVED' internally generally) */}
        <div className="grid grid-cols-3 gap-1 grid-flow-row mt-2">
          {reliableGridPosts.map((img, i) => (
            <div key={i} className="aspect-square bg-gray-200 cursor-pointer relative group">
              <img src={img} alt="Grid post" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 z-10 text-white">
                 {/* Hover Overlay Stats */}
                 <div className="flex items-center gap-2 font-semibold">
                   <FiHeart size={20} className="fill-white" />
                   <span>{(i * 123 + 45) % 1000}</span>
                 </div>
                 <div className="flex items-center gap-2 font-semibold">
                   <BsPersonBoundingBox size={20} className="fill-white" />
                   <span>{(i * 12 + 4) % 100}</span> 
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informative text if rendering other tabs */}
        {activeTab !== 'POSTS' && (
          <div className="w-full h-[300px] flex items-center justify-center -mt-64 relative z-0 opacity-80 pointer-events-none">
            <p className="text-gray-500 text-sm font-semibold">Section under construction / Empty dummy state</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
