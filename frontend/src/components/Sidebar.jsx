import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GoHomeFill } from "react-icons/go";
import { FiSearch, FiHeart, FiLogOut } from "react-icons/fi";
import { MdOutlineExplore } from "react-icons/md";
import { BiMoviePlay } from "react-icons/bi";
import { RiMessengerLine } from "react-icons/ri";
import { CgAddR } from "react-icons/cg";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaHeart, FaCommentDots } from "react-icons/fa";
import { AppContext } from '../context/AppContext';
import { SocketContext } from '../context/SocketContext';
import avatar from '../assets/img/avatar.png';
import CreatePostModal from './CreatePostModal';

const Sidebar = () => {
  const { userData, handleLogout } = useContext(AppContext);
  const { unreadMessageCount, hasUnreadNotifications, toastNotifications } = useContext(SocketContext);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const sidebarLinks = [
    { name: 'Home', path: '/', icon: <GoHomeFill size={24} /> },
    { name: 'Search', path: '/search', icon: <FiSearch size={24} /> },
    { name: 'Explore', path: '/explore', icon: <MdOutlineExplore size={24} /> },
    { name: 'Reels', path: '/reels', icon: <BiMoviePlay size={24} /> },
    { name: 'Messages', path: '/messages', icon: <RiMessengerLine size={24} /> },
    { name: 'Notifications', path: '/notifications', icon: <FiHeart size={24} /> },
    { name: 'Create', path: '/create', icon: <CgAddR size={24} /> },
    { name: 'Profile', path: '/profile', icon: <img src={userData?.profilePic || avatar} className="w-[24px] h-[24px] rounded-full object-cover object-top" alt="profile" /> },
  ];

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreMenuRef]);

  return (
    <div className="hidden md:flex flex-col border-r border-gray-200 fixed h-screen bg-white z-50 w-[72px] lg:w-[244px] transition-all duration-300">
      <div className="pt-8 pb-5 px-6 lg:px-4 mb-2">
         {/* Logo */}
         <div className="hidden lg:block cursor-pointer">
           <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap');
                .insta-logo-sidebar {
                  font-family: 'Grand Hotel', cursive;
                }
              `}
            </style>
            <h1 className="insta-logo-sidebar text-[28px] font-normal tracking-wide pl-2 leading-none">
              Instagram
            </h1>
         </div>
         <div className="block lg:hidden flex justify-center cursor-pointer">
           {/* Fallback compact logo */}
           <BiMoviePlay size={26} className="text-black" />
         </div>
      </div>

      <div className="flex-1 px-3">
        {sidebarLinks.map((link) => (
          <div key={link.name} className="relative w-full block">
          <NavLink
            to={link.path}
            onClick={(e) => {
              if (link.name === 'Create') {
                e.preventDefault();
                setIsCreateModalOpen(true);
              }
            }}
            className={({isActive}) => `flex items-center gap-4 p-3 my-[2px] rounded-lg cursor-pointer transition relative ${isActive && link.name !== 'Create' ? 'font-bold' : 'font-normal hover:bg-gray-100'}`}
          >
            <div className="flex items-center justify-center lg:justify-start w-full gap-4 text-black relative">
              <div className="group-hover:scale-105 transition-transform text-black flex items-center justify-center relative">
                {link.icon}
                {link.name === 'Messages' && unreadMessageCount > 0 && (
                   <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white font-bold">{unreadMessageCount}</div>
                )}
                {link.name === 'Notifications' && hasUnreadNotifications && (
                   <div className="absolute top-0 right-0 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="hidden lg:block text-[15px]">{link.name}</span>
            </div>
          </NavLink>

          {/* Toast specifically attached next to Notifications */}
          {link.name === 'Notifications' && toastNotifications && toastNotifications.length > 0 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full -ml-18 z-[9999] flex flex-col gap-3 pointer-events-none">
              {toastNotifications.map((toast) => (
                <div key={toast.toastId} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border border-gray-200 w-[260px] opacity-100">
                   {toast.type === 'like' ? (
                       <FaHeart size={22} className="text-red-500" />
                   ) : toast.type === 'comment' ? (
                       <FaCommentDots size={22} className="text-[#0095F6]" />
                   ) : (
                       <FiHeart size={22} className="text-black" />
                   )}
                   <div className="flex flex-col flex-1 overflow-hidden">
                       <span className="text-sm font-semibold truncate text-gray-900">{toast.sender?.username || 'Someone'}</span>
                       <span className="text-xs text-gray-500 truncate">
                          {toast.type === 'like' ? 'liked your post.' : toast.type === 'comment' ? `commented: ${toast.text}` : 'started following you.'}
                       </span>
                   </div>
                </div>
              ))}
            </div>
          )}
          </div>
        ))}
      </div>
      
      <div className="p-3 mb-2 px-3 relative" ref={moreMenuRef}>
         
         {/* Pop-up menu for 'More' */}
         {isMoreOpen && (
           <div className="absolute bottom-full left-3 lg:left-0 mb-2 w-[220px] bg-white rounded-xl shadow-[0_0px_10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 transition-opacity">
             <div 
               onClick={handleLogout}
               className="flex items-center gap-4 px-4 py-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
             >
               <FiLogOut size={20} className="text-black" />
               <span className="text-[14px] text-gray-900 font-normal">Log out</span>
             </div>
           </div>
         )}

         {/* More Button */}
         <div 
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
         >
           <RxHamburgerMenu size={24} />
           <span className="hidden lg:block text-[15px] font-normal">More</span>
         </div>
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {/* Old Toast Position Removed */}
    </div>
  );
};

export default Sidebar;
